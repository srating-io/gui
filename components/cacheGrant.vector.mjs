/* eslint-disable no-console */

/**
 * The gui half of the cache grant known answer vector. Run both halves after touching either:
 *
 *   node components/cacheGrant.vector.mjs                     (here)
 *   node cache-grant.vector.ts                               (in srating.io-servers)
 *
 * The constants below are copied from srating.io-servers/cache-grant.vector.ts and must stay
 * identical. This repo cannot import that submodule's generateHash, so these two files are the
 * only thing holding the two implementations together -- and drift is silent, because a hash that
 * does not match just means grants stop verifying and reads quietly go uncached.
 *
 * Do not "fix" a failure by editing the expected values unless you mean to invalidate every grant
 * currently in flight.
 */
import { hashArguments, signGrantBody } from './cacheGrant.server.ts';

const KEY = 'c3BvcnRzLWNhY2hlLWdyYW50LXZlY3Rvci1rZXktMzI=';

const ARGUMENTS = {
  season: 2026,
  organization_id: 'f1c7cd14-4d8a-11ef-9c04-8a5d10ac6c6b',
  career: 0,
  division_id: '1ff2820e-4d8b-11ef-9c04-8a5d10ac6c6b',
  fxn: 'getTeamRanking',
  career_active: 0,
};

const ARGUMENTS_SCRAMBLED = {
  fxn: 'getTeamRanking',
  career_active: 0,
  division_id: '1ff2820e-4d8b-11ef-9c04-8a5d10ac6c6b',
  organization_id: 'f1c7cd14-4d8a-11ef-9c04-8a5d10ac6c6b',
  season: 2026,
  career: 0,
};

const EXPECTED_HASH = '035d1bf7aeb952145ecceeb5c346c3f79afb71b2410f01564a4ace2f50d66448';

const BODY = 'eyJjIjoicmFua2luZyIsImYiOiJsb2FkIiwiaCI6IjAzNWQxYmY3YWViOTUyMTQ1ZWNjZWViNWMzNDZjM2Y3OWFmYjcxYjI0MTBmMDE1NjRhNGFjZTJmNTBkNjY0NDgiLCJzIjozNjAwLCJlIjoxNzYxMzAwMDAwMDAwLCJwIjoxfQ';
const EXPECTED_SIGNATURE = 'W7SCFdF_fv3cOhlfsQkfZpDkSi93TP0DHHoToJedUBE';

let failed = 0;

const check = (label, actual, expected) => {
  if (actual === expected) {
    console.log(`ok    ${label}`);

    return;
  }

  failed++;
  console.log(`FAIL  ${label}`);
  console.log(`      expected ${String(expected)}`);
  console.log(`      actual   ${String(actual)}`);
};

const key = Buffer.from(KEY, 'base64');

check('the vector key is 32 bytes', key.length, 32);
check('hashArguments', hashArguments(ARGUMENTS), EXPECTED_HASH);
check('hashArguments ignores key order', hashArguments(ARGUMENTS_SCRAMBLED), EXPECTED_HASH);
check(
  'hashArguments ignores hidden_access',
  hashArguments({ ...ARGUMENTS, hidden_access: true }),
  hashArguments({ ...ARGUMENTS, hidden_access: false }),
);
check('signGrantBody', signGrantBody(BODY, key), EXPECTED_SIGNATURE);

if (failed) {
  console.log(`\n${failed} vector(s) failed -- the gui and the api server no longer agree.`);
  process.exit(1);
}

console.log('\nall vectors passed');
