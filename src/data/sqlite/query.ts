import { forEach } from 'lodash';
import { NotBrackets, Brackets } from 'typeorm/browser';

import { RANDOM_BASIC_WEAKNESS, ACE_OF_RODS_CODE } from '@app_constants';
import { QueryParams } from '@data/sqlite/types';
import { WhereExpressionBuilder } from 'typeorm';

export function where(query: string, params?: QueryParams): Brackets {
  return new Brackets((qb) => qb.where(`(${query})`, params));
}

export const ON_YOUR_OWN_RESTRICTION = where(
  `c.slots_normalized is not null AND c.slots_normalized LIKE :slot AND (c.removable_slot is null OR not c.removable_slot)`,
  { slot: '%#ally#%' }
);

export const DECK_BUILDING_OPTION_CARDS_QUERY = where(`c.type_code <> 'investigator' AND c.deck_limit > 0 AND c.deck_options <> '[]'`);

export const BASIC_QUERY = where('c.browse_visible != 0');
export const NO_CUSTOM_CARDS_QUERY = where('c.browse_visible < 16');
export const NO_BARKHAM_CARDS_QUERY = where('c.pack_code != \'zbh\'');
export const NO_DUPLICATES_QUERY = where(
  'c.browse_visible < 8 OR (c.browse_visible > 16 AND c.browse_visible < 24)'
);

export const SCENARIO_CARDS_QUERY = where('c.type_code = \'scenario\'');
export const BASIC_WEAKNESS_QUERY = where(
  `c.type_code != 'scenario' AND c.subtype_code = 'basicweakness' AND c.code != '${RANDOM_BASIC_WEAKNESS}' AND c.duplicate_of_code is null`
);
export const BASIC_WEAKNESS_QUERY_WITH_RBW = where(
  `c.type_code != 'scenario' AND c.subtype_code = 'basicweakness' AND c.duplicate_of_code is null`
);
export const STORY_CARDS_QUERY = where(
  `c.deck_limit >= 1 AND ((c.mythos_card = 1 OR (c.subtype_code is not null AND c.has_restrictions = 0)) OR c.code = '${RANDOM_BASIC_WEAKNESS}' OR c.code = '${ACE_OF_RODS_CODE}')`
);
//  1: goes in decks/bonded
//  2: encounter card
//  4: alt-art-investigator (hidden)
//  8: duplicate-card
// 16: custom card
export const MYTHOS_CARDS_QUERY = where('c.browse_visible in (2,3,18,19)');
export const BROWSE_CARDS_QUERY = where('c.browse_visible in (1,3,17,19)');
export const PLAYER_CARDS_QUERY = where(`c.browse_visible in (1,3,4,17,19,20)`);
export const SYNC_CARDS_QUERY = where(
  `c.browse_visible in (1,3,4,9,11,12,17,19,20,25,27,28)`
);
export const BROWSE_CARDS_WITH_DUPLICATES_QUERY = where(
  'c.browse_visible in (1,3,4,5,7,9,11,12,17,19,20,21,23,25,27,28)'
);
export const INVESTIGATOR_CARDS_QUERY = where('c.sort_by_type = 0');

export function tabooSetQuery(tabooSetId?: number) {
  return `(c.taboo_set_id is null OR c.taboo_set_id = ${tabooSetId || 0})`;
}

export function combineQueriesOpt(
  brackets: Brackets[],
  operation: 'or' | 'and',
  negate?: boolean
): Brackets | undefined {
  if (brackets.length) {
    const [firstQuery, ...restQueries] = brackets;
    return combineQueries(firstQuery, restQueries, operation, negate);
  }
  return undefined;
}

function combineQueryHelper(
  firstQuery: Brackets,
  otherQueries: Brackets[],
  operation: 'or' | 'and'
): (qb: WhereExpressionBuilder) => WhereExpressionBuilder {
  return (qb: WhereExpressionBuilder) => {
    qb = qb.where(firstQuery);
    forEach(otherQueries, (query) => {
      switch (operation) {
        case 'or':
          qb = qb.orWhere(query);
          break;
        case 'and':
          qb = qb.andWhere(query);
          break;
      }
    });
    return qb;
  };
}

export function combineQueries(
  firstQuery: Brackets,
  otherQueries: Brackets[],
  operation: 'or' | 'and',
  negate?: boolean
) {
  const builder = combineQueryHelper(firstQuery, otherQueries, operation);
  if (negate) {
    return new NotBrackets(builder);
  }
  return new Brackets(builder);
}
