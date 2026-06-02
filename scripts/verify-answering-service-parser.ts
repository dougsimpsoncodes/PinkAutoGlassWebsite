/**
 * Parser guard for answering-service intake (matches the repo's ci:guard tsx pattern).
 * Fixtures are drawn from the real message corpus. Run: npx tsx scripts/verify-answering-service-parser.ts
 */
import { parseAnsweringServiceMessage, isAnsweringServiceNumber } from '../src/lib/answeringService';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error(`  ✗ ${msg}`); failures++; }
  else console.log(`  ✓ ${msg}`);
}

// 1) Single full card → all fields + classification 'lead'.
{
  const [c] = parseAnsweringServiceMessage(
    `Phone: +1 303-378-1034\nFirst Name: Pamela\nLast Name: Bowry\nVehicle Year: 2020\nVehicle Make: Mazda\nVehicle Model: 3\nLicense Plate: DLD-S62\nGlass: Windshield\nMessage: Wants pricing. Please call.\nCaller ID: +1 303-378-1034`
  );
  assert(c.classification === 'lead', 'single card → lead');
  assert(c.phoneE164 === '+13033781034', 'phone parsed to E.164');
  assert(c.firstName === 'Pamela' && c.lastName === 'Bowry', 'name parsed');
  assert(c.vehicleYear === 2020 && c.vehicleMake === 'Mazda' && c.vehicleModel === '3', 'vehicle parsed');
  assert(c.licensePlate === 'DLD-S62', 'plate parsed');
  assert(!!c.message && c.message.includes('pricing'), 'message parsed');
}

// 2) Multi-customer (--- separated) → 2 customers.
{
  const list = parseAnsweringServiceMessage(
    `Phone: +1 720-806-0320\nFirst Name: Ian\nLast Name: Tershing\nVehicle Make: Buick\nCaller ID: +1 720-806-0320\n---\nPhone: +1 720-284-1711\nFirst Name: Dylan\nLast Name: Hernandez\nVehicle Make: Jeep\nCaller ID: +1 720-284-1711`
  );
  assert(list.length === 2, 'multi-customer split into 2');
  assert(list[0].firstName === 'Ian' && list[1].firstName === 'Dylan', 'both customers parsed');
}

// 3) Multi-customer, one bad (no phone) + one good → partial success (Codex must-fix).
{
  const list = parseAnsweringServiceMessage(
    `Phone: +1 970-402-5860\nFirst Name: Tuan\nLast Name: Pham\nVehicle Make: Lexus\n---\nFirst Name: NoPhone\nLast Name: Person\nGlass: Windshield`
  );
  assert(list.length === 2, 'partial: both blocks parsed');
  assert(list[0].classification === 'lead' && list[0].phoneE164 === '+19704025860', 'good customer survives');
  assert(list[1].classification === 'manual_review' && list[1].reasonCode === 'no_valid_phone', 'bad customer → manual_review, not dropped');
}

// 4) Insurance/State Farm → non_lead.
{
  const [c] = parseAnsweringServiceMessage(
    `Phone: +1 888-624-4410\nFirst Name: Timia\nLast Name: Declined\nGlass: Already replaced\nMessage: Calling from StateFarm Claims regarding the referral for service that has already been completed.\nCaller ID: +1 800-800-0101`
  );
  assert(c.classification === 'non_lead' && c.reasonCode === 'insurance_claim', 'State Farm claim → non_lead/insurance_claim');
}

// 5) Solicitation/PPC → non_lead.
{
  const [c] = parseAnsweringServiceMessage(
    `Phone: 0000000000\nFirst Name: Joe\nLast Name: Brown\nMessage: Joe called to speak with the owner regarding your PPC account. Please call back.\nCaller ID: +31 5966506`
  );
  assert(c.classification === 'non_lead' && c.reasonCode === 'solicitation', 'PPC pitch → non_lead/solicitation');
}

// 6) International caller-ID, no US Phone → manual_review.
{
  const [c] = parseAnsweringServiceMessage(
    `First Name: Joe\nLast Name: Brown\nMessage: Partial message, asked for owner.\nCaller ID: +60 6-653 9117`
  );
  assert(c.classification === 'manual_review' && !c.phoneE164, 'international caller-id → manual_review, no fake US phone');
}

// 7) Placeholders ("Does not have") → field null but still a lead.
{
  const [c] = parseAnsweringServiceMessage(
    `Phone: +1 303-204-0046\nFirst Name: Darell\nLast Name: Mohrlang\nVehicle Make: Dodge\nLicense Plate: Does not have\nGlass: Front Windshield\nCaller ID: +1 303-204-0046`
  );
  assert(c.classification === 'lead', 'placeholder plate still a lead');
  assert(c.licensePlate === null, '"Does not have" → null plate');
}

// 8) Phone vs Caller ID differ → Phone wins, callerId captured.
{
  const [c] = parseAnsweringServiceMessage(
    `Phone: +1 303-901-7751\nFirst Name: Jess\nLast Name: Barajas\nGlass: Windshield\nCaller ID: +1 720-232-9651`
  );
  assert(c.phoneE164 === '+13039017751', 'Phone field is the dedupe key');
  assert(c.callerIdE164 === '+17202329651', 'differing Caller ID captured separately');
}

// 9) Sender-number membership helper.
assert(isAnsweringServiceNumber('+14052664647') && isAnsweringServiceNumber('+14058606684'), 'both service numbers recognized');
assert(!isAnsweringServiceNumber('+17209187465'), 'business line not a service number');

console.log(failures === 0 ? '\nANSWERING-SERVICE PARSER: ALL CHECKS PASSED' : `\nANSWERING-SERVICE PARSER: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
