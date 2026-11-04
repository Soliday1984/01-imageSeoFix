import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = existsSync('apps/console') ? resolve('apps/console') : process.cwd();
let acquisition, growth, sqlite, db;
before(async () => {
  acquisition = await import(pathToFileURL(join(root,'src/lib/acquisition.ts')));
  growth = await import(pathToFileURL(join(root,'src/lib/growth-events.ts')));
  sqlite = new DatabaseSync(':memory:');
  const migrations = existsSync(join(root,'migrations')) ? join(root,'migrations') : join(root,'src/db/migrations');
  const file = (await readdir(migrations)).find(n=>n.endsWith('_growth_events.sql'));
  sqlite.exec(await readFile(join(migrations,file),'utf8'));
  db = {prepare(query) {return {bind(...values) {return {run:async()=>sqlite.prepare(query).run(...values)}}}}};
});
after(async () => {
  sqlite?.close();
});
const documentResponse = () => new Response('ok',{headers:{'content-type':'text/html'}});
function firstVisit(url='https://example.com/guides?utm_source=newsletter&utm_medium=email&utm_campaign=launch&token=SECRET',extra={}) {
  return acquisition.captureAcquisition(new Request(url,{headers:extra}),documentResponse());
}
function cookieHeaders(response) {return new Headers({cookie:response.headers.get('set-cookie').split(';')[0]});}

test('first touch strips query secrets, is HttpOnly, and survives a later visit',()=>{
  const response=firstVisit();const cookie=response.headers.get('set-cookie');
  assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.doesNotMatch(cookie,/SECRET|token/);
  const headers=cookieHeaders(response);const data=acquisition.readAcquisition(headers);
  assert.equal(data.source,'newsletter');assert.equal(data.medium,'email');assert.equal(data.landingPath,'/guides');
  const next=acquisition.captureAcquisition(new Request('https://example.com/pricing?utm_source=other',{headers}),documentResponse());
  assert.equal(next.headers.get('set-cookie'),null);
});
test('organic and paid Google/Bing are kept separate; internal referrals are unknown',()=>{
  assert.equal(acquisition.acquisitionForRequest(new Request('https://example.com/',{headers:{referer:'https://www.google.com/search?q=private'}})).medium,'organic');
  const paid=acquisition.acquisitionForRequest(new Request('https://example.com/?gclid=PRIVATE',{headers:{referer:'https://www.google.com/'}}));
  assert.equal(paid.medium,'cpc');assert.equal(paid.source,'google');assert.doesNotMatch(JSON.stringify(paid),/PRIVATE/);
  assert.equal(acquisition.acquisitionForRequest(new Request('https://example.com/?msclkid=PRIVATE')).source,'bing');
  assert.equal(acquisition.acquisitionForRequest(new Request('https://example.com/',{headers:{referer:'https://app.example.com/'}})).source,'unknown');
});
test('opt-outs, malformed/expired cookies, invalid labels and non-documents are safe',()=>{
  for(const header of ['dnt','sec-gpc']) assert.equal(firstVisit(undefined,{[header]:'1'}).headers.get('set-cookie'),null);
  assert.equal(acquisition.readAcquisition(new Headers({cookie:'acquisition_v1=%BAD'})).source,'unknown');
  const data=acquisition.acquisitionForRequest(new Request('https://example.com/?utm_source=user@example.com'));
  assert.equal(data.source,'direct');
  assert.equal(acquisition.readAcquisition(cookieHeaders(firstVisit()),Date.now()+31*86400000).source,'unknown');
  assert.equal(acquisition.captureAcquisition(new Request('https://example.com/a.js'),new Response('js')).headers.get('set-cookie'),null);
});
test('confirmed events keep first attribution; retries count once; unknown can be repaired',async()=>{
  const headers=cookieHeaders(firstVisit());
  await growth.attachAcquisition(db,'user:alice',new Headers());
  await growth.attachAcquisition(db,'user:alice',headers);
  await growth.attachAcquisition(db,'user:alice',cookieHeaders(firstVisit('https://example.com/?utm_source=other')));
  const event={key:'signup:alice',name:'sign_up',subject:'user:alice'};
  await growth.recordGrowthEvent(db,event);await growth.recordGrowthEvent(db,event);
  const rows=sqlite.prepare("SELECT * FROM growth_events WHERE event_name='sign_up'").all();
  assert.equal(rows.length,1);assert.equal(JSON.parse(rows[0].attribution_json).source,'newsletter');
});
test('paid invoices distinguish test/live and renewal; zero/unpaid/manual-paid do not count',async()=>{
  const invoice={id:'in_live',status:'paid',amount_paid:3900,currency:'usd',livemode:true,billing_reason:'subscription_create',created:123};
  const initial=growth.stripeInvoiceEvent(invoice,'user:alice');
  assert.equal(initial.isTest,false);assert.equal(initial.paymentKind,'initial');assert.equal(initial.occurredAt,123000);
  await growth.recordGrowthEvent(db,initial);await growth.recordGrowthEvent(db,initial);
  const renewal=growth.stripeInvoiceEvent({...invoice,id:'in_renew',billing_reason:'subscription_cycle'},'user:alice');
  assert.equal(renewal.paymentKind,'renewal');await growth.recordGrowthEvent(db,renewal);
  const sandbox=growth.stripeInvoiceEvent({...invoice,id:'in_test',livemode:false},'user:alice');
  await growth.recordGrowthEvent(db,sandbox);
  for(const patch of [{status:'open'},{amount_paid:0},{amount_paid:-1},{paid_out_of_band:true}]) assert.equal(growth.stripeInvoiceEvent({...invoice,...patch},'user:alice'),null);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM growth_events WHERE event_name='purchase' AND is_test=0").get().n,2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM growth_events WHERE event_name='purchase' AND is_test=0 AND payment_kind='initial'").get().n,1);
});

test('later product actions inherit the test flag from the confirmed signup', async()=>{
  await growth.recordGrowthEvent(db,{key:'signup:bob',name:'sign_up',subject:'user:bob',isTest:true});
  await growth.recordGrowthEvent(db,{key:'assistant:bob',name:'assistant_created',subject:'user:bob'});
  assert.equal(sqlite.prepare("SELECT is_test FROM growth_events WHERE event_key='assistant:bob'").get().is_test,1);
});
