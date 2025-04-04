import { find, map } from 'lodash';
import { t } from 'ttag';

import {
  CUSTOM,
  CORE,
  RTNOTZ,
  DWL,
  RTDWL,
  PTC,
  GOB,
  RTPTC,
  TFA,
  RTTFA,
  TCU,
  FOF,
  TDE,
  TDEA,
  TDEB,
  TIC,
  TDC,
  CampaignDifficulty,
  CampaignCycleCode,
  CustomCampaignLog,
  ScenarioResult,
  STANDALONE,
  ALICE_IN_WONDERLAND,
  CALL_OF_THE_PLAGUEBEARER,
  DARK_MATTER,
  RTTCU,
  EOE,
  CROWN_OF_EGIL,
  TSK,
  CYCLOPEAN_FOUNDATIONS,
  HEART_OF_DARKNESS,
  RTTIC,
  FHV,
  OZ,
  AGES_UNWOUND,
} from '@actions/types';
import { ChaosBag } from '@app_constants';
import Card from '@data/types/Card';
import { ThemeColors } from '@styles/theme';
import { Campaign_Difficulty_Enum } from '@generated/graphql/apollo-schema';

const authors = {
  [DARK_MATTER]: 'Axolotl',
  [ALICE_IN_WONDERLAND]: 'The Beard',
  [OZ]: 'The Beard',
  [CROWN_OF_EGIL]: 'The Mad Juggler',
  [CALL_OF_THE_PLAGUEBEARER]: 'Walker Graves',
  [CYCLOPEAN_FOUNDATIONS]: 'The Beard',
  [HEART_OF_DARKNESS]: 'Vinn Quest',
  [RTTIC]: 'DerBK',
  [AGES_UNWOUND]: 'Olivia Juliet',
}

export function campaignDescription(packCode: CampaignCycleCode): string | undefined {
  switch (packCode) {
    case TDE:
      return t`Campaign A and Campaign B\nEight-part campaign`;
    case TDEA:
      return t`Campaign A\nFour-part campaign`;
    case TDEB:
      return t`Campaign B\nFour-part campaign`;
    case GOB:
      return t`Two-part campaign variant`;
    case DARK_MATTER:
    case ALICE_IN_WONDERLAND:
    case OZ:
    case CROWN_OF_EGIL:
    case CALL_OF_THE_PLAGUEBEARER:
    case CYCLOPEAN_FOUNDATIONS:
    case HEART_OF_DARKNESS:
    case AGES_UNWOUND:
    case RTTIC:
      const author = authors[packCode];
      return t`Fan-made campaign by ${author}`;
    default:
      return undefined;
  }
}

export function difficultyString(difficulty: CampaignDifficulty | Campaign_Difficulty_Enum): string {
  switch (difficulty) {
    case CampaignDifficulty.EASY:
    case Campaign_Difficulty_Enum.Easy:
      return t`Easy`;
    case CampaignDifficulty.STANDARD:
    case Campaign_Difficulty_Enum.Standard:
      return t`Standard`;
    case CampaignDifficulty.HARD:
    case Campaign_Difficulty_Enum.Hard:
      return t`Hard`;
    case CampaignDifficulty.EXPERT:
    case Campaign_Difficulty_Enum.Expert:
      return t`Expert`;
    default: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const _exhaustiveCheck: never = difficulty;
      return 'Unknown';
    }
  }
}

export function campaignName(cycleCode: CampaignCycleCode): string | null {
  switch (cycleCode) {
    case CORE: return t`Night of the Zealot`;
    case RTNOTZ: return t`Return to the Night of the Zealot`;
    case DWL: return t`The Dunwich Legacy`;
    case RTDWL: return t`Return to The Dunwich Legacy`;
    case PTC: return t`The Path To Carcosa`;
    case RTPTC: return t`Return to The Path to Carcosa`;
    case TFA: return t`The Forgotten Age`;
    case RTTFA: return t`Return to The Forgotten Age`;
    case TCU: return t`The Circle Undone`;
    case RTTCU: return t`Return to The Circle Undone`;
    case TDE: return t`The Dream-Eaters`;
    case TDEA: return t`The Dream-Quest`;
    case TDEB: return t`The Web of Dreams`;
    case TIC: return t`The Innsmouth Conspiracy`;
    case EOE: return t`Edge of the Earth`;
    case TSK: return t`The Scarlet Keys`;
    case FHV: return t`The Feast of Hemlock Vale`;
    case CUSTOM: return null;
    case STANDALONE: return t`Standalone`;
    case DARK_MATTER: return t`Dark Matter`;
    case ALICE_IN_WONDERLAND: return t`Alice in Wonderland`;
    case CROWN_OF_EGIL: return t`Crown of Egil`;
    case GOB: return t`Guardians of the Abyss`;
    case FOF: return t`Fortune and Folly`;
    case CALL_OF_THE_PLAGUEBEARER: return t`Call of the Plaguebearer`;
    case CYCLOPEAN_FOUNDATIONS: return t`Cyclopean Foundations`;
    case HEART_OF_DARKNESS: return t`Heart of Darkness`;
    case RTTIC: return t`The (Unofficial) Return to the Innsmouth Conspiracy`;
    case OZ: return t`The Colour Out of Oz`;
    case AGES_UNWOUND: return t`Ages Unwound`;
    case TDC: return t`The Drowned City`;
    default: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const _exhaustiveCheck: never = cycleCode;
      return null;
    }
  }
}

export interface Scenario {
  name: string;
  code: string;
  pack_code?: string;
  interlude?: boolean;
  legacy_codes?: string[];
}

export function scenarioFromCard(card: Card): Scenario | null {
  if (!card.encounter_code) {
    return null;
  }
  return {
    name: card.renderName,
    code: card.encounter_code,
    pack_code: card.pack_code,
  };
}

export function completedScenario(
  scenarioResults?: ScenarioResult[]
): (scenario: Scenario) => boolean {
  const finishedScenarios = new Set(
    map(scenarioResults || [], result => result.scenarioCode)
  );
  const finishedScenarioNames = new Set(
    map(scenarioResults || [], result => result.scenario)
  );
  return (scenario: Scenario) => (
    finishedScenarioNames.has(scenario.name) ||
    finishedScenarios.has(scenario.code) ||
    !!find(scenario.legacy_codes || [],
      code => finishedScenarios.has(code)
    )
  );
}

export function campaignScenarios(cycleCode: CampaignCycleCode): Scenario[] {
  switch (cycleCode) {
    case CORE: return [
      { name: t`The Gathering`, code: 'torch', pack_code: 'core' },
      { name: t`The Midnight Masks`, code: 'arkham', pack_code: 'core' },
      { name: t`The Devourer Below`, code: 'tentacles', pack_code: 'core' },
    ];
    case DWL: return [
      { name: t`Prologue`, code: 'dwl_prologue', interlude: true },
      { name: t`Extracurricular Activity`, code: 'extracurricular_activity', pack_code: 'dwl' },
      { name: t`The House Always Wins`, code: 'the_house_always_wins', pack_code: 'dwl' },
      { name: t`Armitage’s Fate`, code: 'armitages_fate', interlude: true },
      { name: t`The Miskatonic Museum`, code: 'the_miskatonic_museum', pack_code: 'tmm' },
      { name: t`Essex County Express`, code: 'essex_county_express', pack_code: 'tece' },
      { name: t`Blood on the Altar`, code: 'blood_on_the_altar', pack_code: 'bota' },
      { name: t`The Survivors`, code: 'dwl_interlude2', interlude: true },
      { name: t`Undimensioned and Unseen`, code: 'undimensioned_and_unseen', pack_code: 'uau' },
      { name: t`Where Doom Awaits`, code: 'where_doom_awaits', pack_code: 'wda' },
      { name: t`Lost in Time and Space`, code: 'lost_in_time_and_space', pack_code: 'litas' },
      { name: t`Epilogue`, code: 'dwl_epilogue', interlude: true },
    ];
    case RTDWL: return [
      { name: t`Prologue`, code: 'dwl_prologue', interlude: true },
      { name: t`Return to Extracurricular Activity`, code: 'return_to_extracurricular_activity', pack_code: 'rtdwl' },
      { name: t`Return to The House Always Wins`, code: 'return_to_the_house_always_wins', pack_code: 'rtdwl' },
      { name: t`Armitage’s Fate`, code: 'armitages_fate', interlude: true },
      { name: t`Return to The Miskatonic Museum`, code: 'return_to_the_miskatonic_museum', pack_code: 'rtdwl' },
      { name: t`Return to Essex County Express`, code: 'return_to_essex_county_express', pack_code: 'rtdwl' },
      { name: t`Return to Blood on the Altar`, code: 'return_to_blood_on_the_altar', pack_code: 'rtdwl' },
      { name: t`The Survivors`, code: 'dwl_interlude2', interlude: true },
      { name: t`Return to Undimensioned and Unseen`, code: 'return_to_undimensioned_and_unseen', pack_code: 'rtdwl' },
      { name: t`Return to Where Doom Awaits`, code: 'return_to_where_doom_awaits', pack_code: 'rtdwl' },
      { name: t`Return to Lost in Time and Space`, code: 'return_to_lost_in_time_and_space', pack_code: 'rtdwl' },
      { name: t`Epilogue`, code: 'dwl_epilogue', interlude: true },
    ];
    case PTC: return [
      { name: t`Prologue`, code: 'ptc_prologue', interlude: true },
      { name: t`Curtain Call`, code: 'curtain_call', pack_code: 'ptc' },
      { name: t`The Last King`, code: 'the_last_king', pack_code: 'ptc' },
      { name: t`Lunacy’s Reward`, code: 'ptc_interlude1', interlude: true },
      { name: t`Echoes of the Past`, code: 'echoes_of_the_past', pack_code: 'eotp' },
      { name: t`The Unspeakable Oath`, code: 'the_unspeakable_oath', pack_code: 'tuo' },
      { name: t`Lost Soul`, code: 'ptc_interlude2', interlude: true },
      { name: t`A Phantom of Truth`, code: 'a_phantom_of_truth', pack_code: 'apot' },
      { name: t`The Pallid Mask`, code: 'the_pallid_mask', pack_code: 'tpm' },
      { name: t`Black Stars Rise`, code: 'black_stars_rise', pack_code: 'bsr' },
      { name: t`Dim Carcosa`, code: 'dim_carcosa', pack_code: 'dca' },
      { name: t`Epilogue`, code: 'ptc_epilogue', interlude: true },
    ];
    case RTPTC: return [
      { name: t`Prologue`, code: 'ptc_prologue', interlude: true },
      { name: t`Return to Curtain Call`, code: 'return_to_curtain_call', pack_code: 'rtptc' },
      { name: t`Return to The Last King`, code: 'return_to_the_last_king', pack_code: 'rtptc' },
      { name: t`Lunacy’s Reward`, code: 'ptc_interlude1', interlude: true },
      { name: t`Return to Echoes of the Past`, code: 'return_to_echoes_of_the_past', pack_code: 'rtptc' },
      { name: t`Return to The Unspeakable Oath`, code: 'return_to_the_unspeakable_oath', pack_code: 'rtptc' },
      { name: t`Lost Soul`, code: 'ptc_interlude2', interlude: true },
      { name: t`Return to A Phantom of Truth`, code: 'return_to_a_phantom_of_truth', pack_code: 'rtptc' },
      { name: t`Return to The Pallid Mask`, code: 'return_to_the_pallid_mask', pack_code: 'rtptc' },
      { name: t`Return to Black Stars Rise`, code: 'return_to_black_stars_rise', pack_code: 'rtptc' },
      { name: t`Return to Dim Carcosa`, code: 'return_to_dim_carcosa', pack_code: 'rtptc' },
      { name: t`Epilogue`, code: 'ptc_epilogue', interlude: true },
    ];
    case TFA: return [
      { name: t`Prologue`, code: 'tfa_prologue', interlude: true },
      { name: t`The Untamed Wilds`, code: 'wilds', pack_code: 'tfa' },
      { name: t`Restless Nights`, code: 'tfa_interlude1', interlude: true },
      { name: t`The Doom of Eztli`, code: 'eztli', pack_code: 'tfa' },
      { name: t`Expedition’s End`, code: 'tfa_interlude2', interlude: true },
      { name: t`Threads of Fate`, code: 'threads_of_fate', pack_code: 'tof' },
      { name: t`The Boundary Beyond`, code: 'the_boundary_beyond', pack_code: 'tbb' },
      { name: t`The Jungle Beckons`, code: 'tfa_interlude3', interlude: true },
      { name: t`Heart of the Elders`, code: 'heart_of_the_elders', pack_code: 'hote' },
      { name: t`The City of Archives`, code: 'the_city_of_archives', pack_code: 'tcoa' },
      { name: t`Those Held Captive`, code: 'tfa_interlude4', interlude: true },
      { name: t`The Depths of Yoth`, code: 'the_depths_of_yoth', pack_code: 'tdoy' },
      { name: t`The Darkness`, code: 'tfa_interlude5', interlude: true },
      { name: t`Shattered Aeons`, code: 'shattered_aeons', pack_code: 'sha' },
      { name: t`Epilogue`, code: 'tfa_epilogue', interlude: true },
    ];
    case RTTFA: return [
      { name: t`Prologue`, code: 'tfa_prologue', interlude: true },
      { name: t`Return to The Untamed Wilds`, code: 'return_to_the_untamed_wilds', pack_code: 'tfa' },
      { name: t`Restless Nights`, code: 'tfa_interlude1', interlude: true },
      { name: t`Return to The Doom of Eztli`, code: 'return_to_the_doom_of_eztli', pack_code: 'tfa' },
      { name: t`Expedition’s End`, code: 'tfa_interlude2', interlude: true },
      { name: t`Return to Threads of Fate`, code: 'return_to_threads_of_fate', pack_code: 'tof' },
      { name: t`Return to The Boundary Beyond`, code: 'return_to_the_boundary_beyond', pack_code: 'tbb' },
      { name: t`The Jungle Beckons`, code: 'tfa_interlude3', interlude: true },
      { name: t`Return to Heart of the Elders`, code: 'return_to_heart_of_the_elders', pack_code: 'hote' },
      { name: t`Return to The City of Archives`, code: 'return_to_the_city_of_archives', pack_code: 'tcoa' },
      { name: t`Those Held Captive`, code: 'tfa_interlude4', interlude: true },
      { name: t`Return to The Depths of Yoth`, code: 'return_to_the_depths_of_yoth', pack_code: 'tdoy' },
      { name: t`The Darkness`, code: 'tfa_interlude5', interlude: true },
      { name: t`Return to Shattered Aeons`, code: 'return_to_shattered_aeons', pack_code: 'sha' },
      { name: t`Epilogue`, code: 'tfa_epilogue', interlude: true },
    ];
    case TCU: return [
      {
        name: t`Prologue: Disappearance at the Twilight Estate`,
        code: 'disappearance_at_the_twilight_estate',
        legacy_codes: ['tcu_prologue'],
        pack_code: 'tcu',
      },
      { name: t`The Witching Hour`, code: 'the_witching_hour', pack_code: 'tcu' },
      {
        name: t`At Death's Doorstep`,
        legacy_codes: ['at_deaths_doorstep_23', 'at_deaths_doorstep_1'],
        code: 'at_deaths_doorstep',
        pack_code: 'tcu',
      },
      { name: t`The Price of Progress`, code: 'tcu_interlude_2', interlude: true },
      { name: t`The Secret Name`, code: 'the_secret_name', pack_code: 'tsn' },
      { name: t`The Wages of Sin`, code: 'the_wages_of_sin', pack_code: 'tws' },
      { name: t`For the Greater Good`, code: 'for_the_greater_good', pack_code: 'fgg' },
      { name: t`The Inner Circle`, code: 'tcu_interlude_3', interlude: true },
      { name: t`Union and Disillusion`, code: 'union_and_disillusion', pack_code: 'uad' },
      { name: t`In the Clutches of Chaos`, code: 'in_the_clutches_of_chaos', pack_code: 'icc' },
      { name: t`Twist of Fate`, code: 'tcu_interlude_4', interlude: true },
      { name: t`Before the Black Throne`, code: 'before_the_black_throne', pack_code: 'bbt' },
      { name: t`Epilogue`, code: 'tcu_epilogue', interlude: true },
    ];
    case RTTCU: return [
      {
        name: t`Prologue: Return to Disappearance at the Twilight Estate`,
        code: 'disappearance_at_the_twilight_estate',
        legacy_codes: ['tcu_prologue'],
        pack_code: 'tcu',
      },
      { name: t`Return to The Witching Hour`, code: 'return_to_the_witching_hour', pack_code: 'tcu' },
      {
        name: t`Return to At Death's Doorstep`,
        legacy_codes: ['at_deaths_doorstep_23', 'at_deaths_doorstep_1'],
        code: 'return_to_at_deaths_doorstep',
        pack_code: 'tcu',
      },
      { name: t`The Price of Progress`, code: 'tcu_interlude_2', interlude: true },
      { name: t`Return to The Secret Name`, code: 'return_to_the_secret_name', pack_code: 'tsn' },
      { name: t`Return to The Wages of Sin`, code: 'return_to_the_wages_of_sin', pack_code: 'tws' },
      { name: t`Return to For the Greater Good`, code: 'return_to_for_the_greater_good', pack_code: 'fgg' },
      { name: t`The Inner Circle`, code: 'tcu_interlude_3', interlude: true },
      { name: t`Return to Union and Disillusion`, code: 'return_to_union_and_disillusion', pack_code: 'uad' },
      { name: t`Return to In the Clutches of Chaos`, code: 'return_to_in_the_clutches_of_chaos', pack_code: 'icc' },
      { name: t`Twist of Fate`, code: 'tcu_interlude_4', interlude: true },
      { name: t`Return to Before the Black Throne`, code: 'return_to_before_the_black_throne', pack_code: 'bbt' },
      { name: t`Epilogue`, code: 'tcu_epilogue', interlude: true },
    ];
    case RTNOTZ: return [
      { name: t`Return to The Gathering`, code: 'return_to_the_gathering', pack_code: 'rtnotz' },
      { name: t`Return to the Midnight Masks`, code: 'return_to_the_midnight_masks', pack_code: 'rtnotz' },
      { name: t`Return to the Devourer Below`, code: 'return_to_the_devourer_below', pack_code: 'rtnotz' },
    ];
    case TDEA: return [
      { name: t`Prologue`, code: 'prologue', pack_code: 'tde', interlude: true },
      { name: t`Beyond the Gates of Sleep`, code: 'beyond_the_gates_of_sleep', pack_code: 'tde' },
      { name: t`The Black Cat`, code: 'black_cat', pack_code: 'tde', interlude: true },
      { name: t`The Search for Kadath`, code: 'the_search_for_kadath', pack_code: 'sfk', legacy_codes: ['sfk'] },
      { name: t`The Oneironauts`, code: 'oneironauts', pack_code: 'sfk', interlude: true },
      { name: t`Dark Side of the Moon`, code: 'dark_side_of_the_moon', pack_code: 'dsm', legacy_codes: ['dsm'] },
      { name: t`The Great Ones`, code: 'great_ones', pack_code: 'dsm', interlude: true },
      { name: t`Where Gods Dwell`, code: 'where_the_gods_dwell', pack_code: 'wgd', legacy_codes: ['wgd'] },
      { name: t`Epilogue`, code: 'epligoue', pack_code: 'wgd', interlude: true },
    ];
    case TDEB: return [
      { name: t`Prologue`, code: 'prologue', pack_code: 'tde', interlude: true },
      { name: t`Waking Nightmare`, code: 'waking_nightmare', pack_code: 'tde' },
      { name: t`The Black Cat`, code: 'black_cat', pack_code: 'tde', interlude: true },
      { name: t`A Thousand Shapes of Horror`, code: 'a_thousand_shapes_of_horror', pack_code: 'tsh', legacy_codes: ['tsh'] },
      { name: t`The Oneironauts`, code: 'oneironauts', pack_code: 'sfk', interlude: true },
      { name: t`Point of No Return`, code: 'point_of_no_return', pack_code: 'pnr', legacy_codes: ['pnr'] },
      { name: t`The Great Ones`, code: 'great_ones', pack_code: 'dsm', interlude: true },
      { name: t`Weaver of the Cosmos`, code: 'weaver_of_the_cosmos', pack_code: 'woc' },
      { name: t`Epilogue`, code: 'epligoue', pack_code: 'wgd', interlude: true },
    ];
    case TIC: return [
      { name: t`The Pit of Despair`, code: 'the_pit_of_despair', pack_code: 'tic' },
      { name: t`Puzzle Pieces`, code: 'puzzle_pieces', pack_code: 'tic', interlude: true },
      { name: t`The Vanishing of Elina Harper`, code: 'the_vanishing_of_elina_harper', pack_code: 'tic' },
      { name: t`The Syzygy`, code: 'syzygy', pack_code: 'tic', interlude: true },
      { name: t`In Too Deep`, code: 'in_too_deep', pack_code: 'itc' },
      { name: t`Devil Reef`, code: 'devil_reef', pack_code: 'def' },
      { name: t`Beneath the Waves`, code: 'beneath_the_waves', pack_code: 'def', interlude: true },
      { name: t`Horror in High Gear`, code: 'horror_in_high_gear', pack_code: 'hhg' },
      { name: t`A Light in the Fog`, code: 'a_light_in_the_fog', pack_code: 'lif' },
      { name: t`The Lair of Dagon`, code: 'lair_of_dagon', pack_code: 'lod' },
      { name: t`Hidden Truths`, code: 'hidden_truths', pack_code: 'lod', interlude: true },
      { name: t`Into the Maelstrom`, code: 'into_the_maelstrom', pack_code: 'itm' },
      { name: t`Epilogue`, code: 'epligoue', pack_code: 'itm', interlude: true },
    ];

    case RTTIC: return [
      { name: t`Return to The Pit of Despair`, code: 'zreturn_to_the_pit_of_despair', pack_code: 'tic' },
      { name: t`Puzzle Pieces`, code: 'puzzle_pieces', pack_code: 'tic', interlude: true },
      { name: t`Return to The Vanishing of Elina Harper`, code: 'zreturn_to_the_vanishing_of_elina_harper', pack_code: 'tic' },
      { name: t`The Syzygy`, code: 'syzygy', pack_code: 'tic', interlude: true },
      { name: t`Return to In Too Deep`, code: 'zreturn_to_in_too_deep', pack_code: 'itc' },
      { name: t`Return to Devil Reef`, code: 'zreturn_to_devil_reef', pack_code: 'def' },
      { name: t`Beneath the Waves`, code: 'beneath_the_waves', pack_code: 'def', interlude: true },
      { name: t`Return to Horror in High Gear`, code: 'zreturn_to_horror_in_high_gear', pack_code: 'hhg' },
      { name: t`Return to A Light in the Fog`, code: 'zreturn_to_a_light_in_the_fog', pack_code: 'lif' },
      { name: t`Return to The Lair of Dagon`, code: 'zreturn_to_lair_of_dagon', pack_code: 'lod' },
      { name: t`Hidden Truths`, code: 'hidden_truths', pack_code: 'lod', interlude: true },
      { name: t`Return to Into the Maelstrom`, code: 'zreturn_to_into_the_maelstrom', pack_code: 'itm' },
      { name: t`Epilogue`, code: 'epligoue', pack_code: 'itm', interlude: true },
    ];
    case EOE: return [
      { name: t`Prologue`, code: 'prologue', pack_code: 'eoec', interlude: true },
      { name: t`Ice and Death: Part 1`, code: 'ice_and_death_part_1', pack_code: 'eoec' },
      { name: t`Ice and Death: Part 2`, code: 'ice_and_death_part_2', pack_code: 'eoec' },
      { name: t`Ice and Death: Part 3`, code: 'ice_and_death_part_3', pack_code: 'eoec' },
      { name: t`Restful Night`, code: 'restful_night', pack_code: 'eoec', interlude: true },
      { name: t`To the Forbidden Peaks`, code: 'to_the_forbidden_peaks', pack_code: 'eoec' },
      { name: t`Endless Night`, code: 'endless_night', pack_code: 'eoec', interlude: true },
      { name: t`City of the Elder Things`, code: 'city_of_the_elder_things', pack_code: 'eoec' },
      { name: t`Final Night`, code: 'final_night', pack_code: 'eoec', interlude: true },
      { name: t`The Heart of Madness: Part 1`, code: 'the_heart_of_madness_part_1', pack_code: 'eoec' },
      { name: t`The Heart of Madness: Part 2`, code: 'the_heart_of_madness_part_2', pack_code: 'eoec' },
      { name: t`Epilogue`, code: 'epilogue', pack_code: 'eoec', interlude: true },
      { name: t`Fatal Mirage`, code: 'fatal_mirage', pack_code: 'eoec' },
      { name: t`Fatal Mirage`, code: 'fatal_mirage_2', pack_code: 'eoec' },
      { name: t`Fatal Mirage`, code: 'fatal_mirage_3', pack_code: 'eoec' },
    ];
    case TSK:
      return [
        { name: t`Prologue: Rain and Riddles`, code: 'riddles_and_rain', pack_code: 'tskc' },
        { name: t`Dead Heat`, code: 'marrakesh', pack_code: 'tskc' },
        { name: t`Sanguine Shadows`, code: 'buenos_aires', pack_code: 'tskc' },
        { name: t`Dealings in the Dark`, code: 'istanbul', pack_code: 'tskc' },
        { name: t`Dancing Mad`, code: 'havana', pack_code: 'tskc' },
        { name: t`On Thin Ice`, code: 'anchorage', pack_code: 'tskc' },
        { name: t`Dogs of War`, code: 'alexandria', pack_code: 'tskc' },
        { name: t`Shades of Suffering`, code: 'kuala_lampur', pack_code: 'tskc' },
        { name: t`Without a Trace`, code: 'bermuda_triangle', pack_code: 'tskc' },
        { name: t`Congress of the Keys`, code: 'tunguska', pack_code: 'tskc' },
      ];
    case FHV:
      return [];
    case DARK_MATTER:
      return [
        { name: t`Prologue`, code: 'dm_prologue', pack_code: 'zdm', interlude: true },
        { name: t`The Tatterdemalion`, code: 'the_tatterdemalion', pack_code: 'zdm' },
        { name: t`Electric Nightmare`, code: 'electric_nightmare', pack_code: 'zdm' },
        { name: t`Mission Briefing`, code: 'mission_briefing', pack_code: 'zdm', interlude: true },
        { name: t`Lost Quantum`, code: 'lost_quantum', pack_code: 'zdm' },
        { name: t`In the Shadow of Earth`, code: 'in_the_shadow_of_earth', pack_code: 'zdm' },
        { name: t`Strange Moons`, code: 'strange_moons', pack_code: 'zdm' },
        { name: t`Introspection`, code: 'introspection', pack_code: 'zdm', interlude: true },
        { name: t`The Machine in Yellow`, code: 'the_machine_in_yellow', pack_code: 'zdm' },
        { name: t`Fragment of Carcosa`, code: 'fragment_of_carcosa', pack_code: 'zdm' },
        { name: t`Starfall`, code: 'starfall', pack_code: 'zdm' },
        { name: t`Epilogue`, code: 'dm_epilogue', pack_code: 'zdm', interlude: true },
      ];

    case CYCLOPEAN_FOUNDATIONS:
      return [
        { name: t`Prologue`, code: 'cf_prologue', pack_code: 'zcf', interlude: true },
        { name: t`Lost Moorings`, code: 'lost_moorings', pack_code: 'zcf' },
        { name: t`Going Twice`, code: 'going_twice', pack_code: 'zcf' },
        { name: t`Private Lives`, code: 'private_lives', pack_code: 'zcf' },
        { name: t`Crumbling Masonry`, code: 'crumbling_masonry', pack_code: 'zcf' },
        { name: t`A House Divided`, code: 'a_house_divided', pack_code: 'zcf', interlude: true },
        { name: t`Across Dreaful Waters`, code: 'across_dreadful_waters', pack_code: 'zcf' },
        { name: t`Blood From Stones`, code: 'blood_from_stones', pack_code: 'zcf' },
        { name: t`Pyroclastic Flow`, code: 'pyroclastic_flow', pack_code: 'zcf' },
        { name: t`Tomb of Dead Dreams`, code: 'tomb_of_dead_dreams', pack_code: 'zcf' },
        { name: t`Epilogue`, code: 'dm_epilogue', pack_code: 'zcf', interlude: true },
      ];
    case ALICE_IN_WONDERLAND:
      return [
        { name: t`Prologue`, code: 'aw_prologue', pack_code: 'zaw', interlude: true },
        { name: t`Arkham in Wonderland`, code: 'arkham_in_wonderland', pack_code: 'zaw' },
        { name: t`The Dodo`, code: 'the_dodo', pack_code: 'zaw', interlude: true },
        { name: t`A Sea of Troubles`, code: 'a_sea_of_troubles', pack_code: 'zaw' },
        { name: t`The Caterpillar`, code: 'the_caterpillar', pack_code: 'zaw', interlude: true },
        { name: t`Tempest in a Teapot`, code: 'tempest_in_a_teapot', pack_code: 'zaw' },
        { name: t`The Duchess`, code: 'the_duchess', pack_code: 'zaw', interlude: true },
        { name: t`Bleeding Hearts`, code: 'bleeding_hearts', pack_code: 'zaw' },
        { name: t`Gryphon and Mock Turtle`, code: 'gryphon_and_mock_turtle', pack_code: 'zaw', interlude: true },
        { name: t`Wild Snark Chase`, code: 'wild_snark_chase', pack_code: 'zaw' },
        { name: t`Humpty Dumpty`, code: 'humpty_dumpty', pack_code: 'zaw', interlude: true },
        { name: t`Sibling Rivalry`, code: 'sibling_rivalry', pack_code: 'zaw' },
        { name: t`The Lion and the Unicorn`, code: 'the_lion_and_the_unicorn', pack_code: 'zaw', interlude: true },
        { name: t`Fool's Mate`, code: 'fools_mate', pack_code: 'zaw' },
        { name: t`The White Queen`, code: 'the_white_queen', pack_code: 'zaw', interlude: true },
        { name: t`Lucid Nightmare`, code: 'Lucid Nightmare', pack_code: 'zaw' },
        { name: t`Epilogue`, code: 'aw_epilogue', pack_code: 'zaw', interlude: true },
      ];
    case TDC:
      return [];

    case AGES_UNWOUND:
    case CROWN_OF_EGIL:
    case CALL_OF_THE_PLAGUEBEARER:
    case TDE:
    case CUSTOM:
    case STANDALONE:
    case GOB:
    case FOF:
    case HEART_OF_DARKNESS:
    case OZ:

      return [];
    default: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const _exhaustiveCheck: never = cycleCode;
      return [];
    }
  }
}

export function campaignNames() {
  return {
    core: t`The Night of the Zealot`,
    rtnotz: t`Return to the Night of the Zealot`,
    dwl: t`The Dunwich Legacy`,
    rtdwl: t`Return to The Dunwich Legacy`,
    ptc: t`The Path to Carcosa`,
    rtptc: t`Return to The Path to Carcosa`,
    tfa: t`The Forgotten Age`,
    rttfa: t`Return to The Forgotten Age`,
    tcu: t`The Circle Undone`,
    rttcu: t`Return to The Circle Undone`,
    tde: t`The Dream-Eaters`,
    tdea: t`The Dream-Quest`,
    tdeb: t`The Web of Dreams`,
    tic: t`The Innsmouth Conspiracy`,
    eoe: t`Edge of the Earth`,
    tskc: t`The Scarlet Keys`,
    fhv: t`The Feast of Hemlock Vale`,
    tdc: t`The Drowned City`,
    gob: t`Guardians of the Abyss`,
    fof: t`Fortune and Folly`,
    zau: t`Ages Unwound`,
    zdm: t`Dark Matter`,
    zaw: t`Alice in Wonderland`,
    zoz: t`The Colour Out of Oz`,
    zce: t`The Crown of Egil`,
    standalone: t`Standalone`,
    zcf: t`Cyclopean Foundations`,
    zcp: t`Call of the Plaguebearer`,
    zhod: t`Heart of Darkness`,
    rttic: 'The (Unofficial) Return to The Innsmouth Conspiracy',
  };
}

export function campaignColor(cycle: CampaignCycleCode | typeof RTTCU | typeof EOE, colors: ThemeColors) {
  switch (cycle) {
    case CORE:
    case RTNOTZ:
    case 'custom':
      return colors.campaign.core;
    case DWL:
    case RTDWL:
    case CROWN_OF_EGIL:
    case CYCLOPEAN_FOUNDATIONS:
    case TDC:
      return colors.campaign.dwl;
    case PTC:
    case RTPTC:
    case AGES_UNWOUND:
      return colors.campaign.ptc;
    case TFA:
    case RTTFA:
    case ALICE_IN_WONDERLAND:
      return colors.campaign.tfa;
    case STANDALONE:
      return colors.campaign.standalone;
    case TCU:
    case RTTCU:
    case OZ:
      return colors.campaign.tcu;
    case TDEA:
    case TDEB:
    case TDE:
    case DARK_MATTER:
      return colors.campaign.tde;
    case TIC:
    case RTTIC:
    case FOF:
    case CALL_OF_THE_PLAGUEBEARER:
      return colors.campaign.tic;
    case TSK:
    case HEART_OF_DARKNESS:
      return colors.campaign.tsk;
    case EOE:
      return colors.campaign.eoe;
    case GOB:
    case FHV:
      return colors.campaign.gob;
  }
}

export function getCampaignLog(
  cycleCode: CampaignCycleCode
): CustomCampaignLog {
  switch (cycleCode) {
    case CORE:
    case RTNOTZ:
      return {
        sections: [
          t`Campaign Notes`,
          t`Cultists We Interrogated`,
          t`Cultists Who Got Away`,
        ],
      };
    case DWL:
    case RTDWL:
      return {
        sections: [
          t`Campaign Notes`,
          t`Sacrificed to Yog-Sothoth`,
        ],
      };
    case PTC:
    case RTPTC:
      return {
        sections: [
          t`Campaign Notes`,
          t`VIPs Interviewed`,
          t`VIPs Slain`,
        ],
        counts: [
          t`Doubt`,
          t`Conviction`,
          t`Chasing the Stranger`,
        ],
      };
    case TFA:
    case RTTFA:
      return {
        sections: [t`Campaign Notes`],
        counts: [t`Yig's Fury`],
        investigatorSections: [t`Supplies`],
        // investigatorCounts
      };
    case TCU:
    case RTTCU:
      return {
        sections: [
          t`Campaign Notes`,
          t`Mementos Discovered`,
          t`Missing Persons - Gavriella Mizrah`,
          t`Missing Persons - Jerome Davids`,
          t`Missing Persons - Penny White`,
          t`Missing Persons - Valentino Rivas`,
        ],
      };
    case TDE:
      return {};
    case TDEA:
      return {
        sections: [
          t`Campaign Notes`,
        ],
        counts: [
          t`Evidence of Kadath`,
        ],
      };
    case TDEB:
      return {
        sections: [
          t`Campaign Notes`,
        ],
        counts: [
          t`Steps of the Bridge`,
        ],
      };
    case TIC:
    case RTTIC:
      return {
        sections: [
          t`Campaign Notes`,
          t`Memories Recovered`,
          t`Possible Suspects`,
          t`Possible Hideouts`,
        ],
      };
    case DARK_MATTER:
      return {
        sections: [
          t`Campaign Notes`,
        ],
        counts: [t`Impending Doom`],
        investigatorCounts: [t`Memories`],
      };
    case ALICE_IN_WONDERLAND:
      return {
        sections: [
          t`Campaign Notes`,
          t`Fragments of Alice`,
          t`Wonderland Boons`,
          t`Wonderland Banes`,
        ],
        counts: [t`Strength of Wonderland`],
      };
    case CALL_OF_THE_PLAGUEBEARER:
      return {
        sections: [
          t`Campaign Notes`,
          t`Eliminated`,
          t`Locations`,
        ],
      };
    case CROWN_OF_EGIL:
      return {
        sections: [
          t`Campaign Notes`,
          t`Traces of Egil`,
        ],
      };
    case CUSTOM:
      return {
        sections: [
          t`Campaign Notes`,
        ],
      };
    case STANDALONE:
    case EOE:
      return {
        sections: [
          t`Campaign Notes`,
          t`Fatal Mirage - Memories Discovered`,
          t`Fatal Mirage - Memories Banished`,
          t`Ice and Death - Locations Revealed`,
          t`Ice and Death - Supplies Recovered`,
          t`The Heart of Madness - Seals Placed`,
          t`The Heart of Madness - Seals Recovered`,
          t`Expedition Team`,
        ],
      };
    case TSK:
      return {
        sections: [
          t`Campaign Notes`,
          t`Keys`,
          t`Unlocked Locations`,
        ],
        counts: [t`Time Passed`],
      };
    case FHV:
      return {
        sections: [
          t`Campaign Notes`,
          t`Day / Time`,
          t`Areas Surveyed`,
          t`Mother Rachel`,
          t`Leah Atwood`,
          t`Simeon Atwood`,
          t`William Hemlock`,
          t`River Hawthorne`,
          t`Gideon Mizrah`,
          t`Judith Park`,
          t`Theo Peters`,
        ],
      };
    case TDC:
      return {
        sections: [
          t`Campaign Notes`,
          t`Artifacts Earned`,
          t`Alien Glyphs`,
          t`Locations Explored`,
        ],

        investigatorCounts: [t`Task Progress`],
      }
    case GOB:
    case FOF:
      return {
        sections: [
          t`Campaign Notes`,
        ],
      };
    case CYCLOPEAN_FOUNDATIONS:
      return {
        sections: [
          t`Campaign Notes`,
          t`Cultists Alive`,
          t`Cultists Killed`,
        ],
        counts: [t`Notice`],
      };
    case HEART_OF_DARKNESS:
      return {
        sections: [
          t`Campaign Notes`,
        ],
        counts: [t`Information on Kurtz`],
      };
    case OZ:
      return {
        sections: [
          t`Campaign Notes`,
          t`Preparations`,
          t`Companions of Oz`,
          t`Advantages`,
          t`Order of Events`,
        ],
      };
    case AGES_UNWOUND:
      return {
        sections: [
          t`Timeline`,
          t`Campaign Notes`,
        ],
        counts: [t`Strange Assistance`],
      };
    default: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const _exhaustiveCheck: never = cycleCode;
      return {
        sections: [
          t`Campaign Notes`,
        ],
      };
    }
  }
}

type ChaosBagByDifficulty = { [difficulty in CampaignDifficulty]: ChaosBag };

const NOTZ_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const DWL_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, auto_fail: 1, elder_sign: 1 },
};
const PTC_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 3, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
};
const TFA_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 2, '-2': 1, '-3': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 3, '-1': 1, '-2': 2, '-3': 1, '-5': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '+1': 1, '0': 2, '-1': 1, '-2': 1, '-3': 2, '-4': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 2, '-6': 1, '-8': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};
const TCU_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 2, '-2': 1, '-3': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 1, '-4': 1, '-6': 1, '-8': 1, skull: 2, auto_fail: 1, elder_sign: 1 },
};

const TDEA_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 2, '-2': 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 1, '-4': 2, '-5': 1, '-6': 1, '-8': 1, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
};
const TDEB_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 1, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
};

const TIC_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 2, tablet: 2, elder_thing: 2, auto_fail: 1, elder_sign: 1 },
};

const EOE_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 3, '0': 2, '-1': 3, '-2': 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, frost: 1, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 2, '-2': 2, '-3': 1, '-4': 2, '-5': 1, frost: 2, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 1, '-2': 2, '-3': 1, '-4': 2, '-5': 1, '-7': 1, frost: 3, skull: 2, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const TSK_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const FHV_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, '-3': 1, skull: 2, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, skull: 2, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-5': 2, '-7': 1, skull: 2, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 2, '-6': 2, '-8': 1, skull: 2, elder_sign: 1 },
};


const TDC_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const DARK_MATTER_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 2, '-2': 2, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
};

const ALICE_IN_WONDERLAND_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '+1': 1, '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 1, '-3': 1, '-4': 1, '-5': 1, '-6': 1, '-7': 1, '-8': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const CYCLOPEAN_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, '-7': 1, skull: 3, tablet: 1, auto_fail: 1, elder_sign: 1 },
};

const CROWN_OF_EGIL_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 2, '-2': 2, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 1, '-3': 2, '-4': 1, '-5': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, auto_fail: 1, elder_sign: 1 },
};
const CALL_OF_THE_PLAGUEBEARER_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 3, '0': 3, '-1': 3, '-2': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 2, '-2': 1, '-3': 3, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 1, '-2': 2, '-3': 2, '-4': 3, '-6': 1, skull: 2, cultist: 1, tablet: 2, auto_fail: 1, elder_sign: 1 },
};
const GOB_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, '-6': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 2, '0': 2, '-1': 3, '-2': 2, '-3': 2, '-4': 1, '-6': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 3, '-3': 2, '-4': 2, '-5': 1, '-7': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '+1': 1, '0': 2, '-1': 3, '-2': 3, '-3': 2, '-4': 2, '-5': 1, '-7': 1, skull: 3, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const FOF_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 1, '0': 2, '-1': 1, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 1, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-6': 1, '-7': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 2, '-1': 2, '-2': 2, '-3': 2, '-6': 1, '-7': 1, skull: 2, cultist: 1, tablet: 1, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};

const ZHOD_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-7': 1, '-8': 1, skull: 2, cultist: 2, auto_fail: 1, elder_sign: 1 },
};

const OZ_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 1, '-3': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 3, '-2': 2, '-3': 1, '-4': 1, '-5': 1, '-6': 1, skull: 2, elder_thing: 1, auto_fail: 1, elder_sign: 1 },
};
const AGES_BAG: ChaosBagByDifficulty = {
  [CampaignDifficulty.EASY]: { '+1': 2, '0': 3, '-1': 3, '-2': 2, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.STANDARD]: { '+1': 1, '0': 2, '-1': 3, '-2': 2, '-3': 1, '-4': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.HARD]: { '0': 3, '-1': 2, '-2': 2, '-3': 2, '-4': 1, '-5': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
  [CampaignDifficulty.EXPERT]: { '0': 1, '-1': 2, '-2': 2, '-3': 2, '-4': 2, '-5': 1, '-6': 1, '-8': 1, skull: 3, cultist: 1, tablet: 1, auto_fail: 1, elder_sign: 1 },
};


function basicScenarioRewards(encounterCode: string) {
  switch (encounterCode) {
    case 'blood_on_the_altar':
      // Each of the professors could be earned here.
      return ['extracurricular_activity', 'the_house_always_wins', 'armitages_fate'];
    case 'the_eternal_slumber':
      return ['abyssal_tribute'];
    case 'the_nights_usurper':
      return ['abyssal_gifts'];
    case 'bayou':
      return ['rougarou'];
    case 'wilds':
    case 'the_untamed_wilds':
    case 'the_doom_of_eztli':
    case 'eztli':
    case 'the_boundary_beyond':
    case 'heart_of_the_elders':
    case 'the_depths_of_yoth':
    case 'turn_back_time':
      // Scenario's that include Poison.
      return ['poison'];
    case 'threads_of_fate':
      // Add Alejandro Vela and basic Relic of Ages
      return ['wilds', 'eztli', 'poison'];
    default:
      return [];
  }
}

export function scenarioRewards(encounterCode: string) {
  const result = basicScenarioRewards(encounterCode);
  if (encounterCode.startsWith('return_to_')) {
    const nonReturnCode = encounterCode.substring('return_to_'.length);
    return [
      nonReturnCode,
      ...result,
      ...basicScenarioRewards(nonReturnCode),
    ];
  }
  return result;
}

export function getChaosBag(
  cycleCode: CampaignCycleCode,
  difficulty: CampaignDifficulty,
): ChaosBag {
  switch (cycleCode) {
    case CORE:
    case RTNOTZ:
    case CUSTOM:
    case STANDALONE:
      return NOTZ_BAG[difficulty];
    case DWL:
    case RTDWL:
      return DWL_BAG[difficulty];
    case PTC:
    case RTPTC:
      return PTC_BAG[difficulty];
    case TFA:
    case RTTFA:
      return TFA_BAG[difficulty];
    case TCU:
    case RTTCU:
      return TCU_BAG[difficulty];
    case TDE:
      return {};
    case TDEA:
      return TDEA_BAG[difficulty];
    case TDEB:
      return TDEB_BAG[difficulty];
    case TIC:
    case RTTIC:
      return TIC_BAG[difficulty];
    case EOE:
      return EOE_BAG[difficulty];
    case TSK:
      return TSK_BAG[difficulty];
    case FHV:
      return FHV_BAG[difficulty];
    case TDC:
      return TDC_BAG[difficulty];
    case DARK_MATTER:
      return DARK_MATTER_BAG[difficulty];
    case ALICE_IN_WONDERLAND:
      return ALICE_IN_WONDERLAND_BAG[difficulty];
    case CROWN_OF_EGIL:
      return CROWN_OF_EGIL_BAG[difficulty];
    case CALL_OF_THE_PLAGUEBEARER:
      return CALL_OF_THE_PLAGUEBEARER_BAG[difficulty];
    case GOB:
      return GOB_BAG[difficulty];
    case FOF:
      return FOF_BAG[difficulty];
    case CYCLOPEAN_FOUNDATIONS:
      return CYCLOPEAN_BAG[difficulty];
    case HEART_OF_DARKNESS:
      return ZHOD_BAG[difficulty];
    case OZ:
      return OZ_BAG[difficulty];
    case AGES_UNWOUND:
      return AGES_BAG[difficulty];
    default: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const _exhaustiveCheck: never = cycleCode;
      return NOTZ_BAG[difficulty];
    }
  }
}


interface RussianLocation {
  nominative: string;
  genitive: string;
  dative: string;
}
export const RUSSIAN_LOCATIONS: { [key: string]: RussianLocation | undefined } = {
  anchorage: {
    nominative: 'Анкоридж',
    genitive: 'Анкориджа',
    dative: 'Анкоридж',
  },
  san_francisco: {
    nominative: 'Сан-Франциско',
    genitive: 'Сан-Франциско',
    dative: 'Сан-Франциско',
  },
  new_orleans: {
    nominative: 'Новый Орлеан',
    genitive: 'Нового Орлеана',
    dative: 'Новый Орлеан',
  },
  arkham: {
    nominative: 'Аркхэм',
    genitive: 'Аркхэма',
    dative: 'Аркхэм',
  },
  ybor_city: {
    nominative: 'Ибор-Сити',
    genitive: 'Ибор-Сити',
    dative: 'Ибор-Сити',
  },
  bermuda: {
    nominative: 'Бермуды',
    genitive: 'Бермуд',
    dative: 'Бермуды',
  },
  bermuda_triangle: {
    nominative: 'Бермудский треугольник',
    genitive: 'Бермудский треугольник',
    dative: 'Бермудский треугольник',
  },
  havana: {
    nominative: 'Гавана',
    genitive: 'Гаваны',
    dative: 'Гавану',
  },
  san_juan: {
    nominative: 'Сан-Хуан',
    genitive: 'Сан-Хуана',
    dative: 'Сан-Хуан',
  },
  rio_de_janiero: {
    nominative: 'Рио-де-Жанейро',
    genitive: 'Рио-де-Жанейро',
    dative: 'Рио-де-Жанейро',
  },
  buenos_aires: {
    nominative: 'Буэнос-Айрес',
    genitive: 'Буэнос-Айреса',
    dative: 'Буэнос-Айрес',
  },
  quito: {
    nominative: 'Кито',
    genitive: 'Кито',
    dative: 'Кито',
  },
  reykjavik: {
    nominative: 'Рейкьявик',
    genitive: 'Рейкьявика',
    dative: 'Рейкьявик',
  },
  london: {
    nominative: 'Лондон',
    genitive: 'Лондона',
    dative: 'Лондон',
  },
  monte_carlo: {
    nominative: 'Монте-Карло',
    genitive: 'Монте-Карло',
    dative: 'Монте-Карло',
  },
  venice: {
    nominative: 'Венеция',
    genitive: 'Венеции',
    dative: 'Венецию',
  },
  rome: {
    nominative: 'Рим',
    genitive: 'Рима',
    dative: 'Рим',
  },
  moscow: {
    nominative: 'Москва',
    genitive: 'Москвы',
    dative: 'Москву',
  },
  istanbul: {
    nominative: 'Константинополь',
    genitive: 'Константинополя',
    dative: 'Константинополь',
  },
  kabul: {
    nominative: 'Кабул',
    genitive: 'Кабула',
    dative: 'Кабул',
  },
  bombay: {
    nominative: 'Бомбей',
    genitive: 'Бомбея',
    dative: 'Бомбей',
  },
  kathmandu: {
    nominative: 'Катманду',
    genitive: 'Катманду',
    dative: 'Катманду',
  },
  tunguska: {
    nominative: 'Тунгуска',
    genitive: 'Тунгуски',
    dative: 'Тунгуску',
  },
  kuala_lampur: {
    nominative: 'Куала-Лумпур',
    genitive: 'Куала-Лумпура',
    dative: 'Куала-Лумпур',
  },
  shanghai: {
    nominative: 'Шанхай',
    genitive: 'Шанхая',
    dative: 'Шанхай',
  },
  hong_kong: {
    nominative: 'Гонконг',
    genitive: 'Гонконга',
    dative: 'Гонконг',
  },
  tokyo: {
    nominative: 'Токио',
    genitive: 'Токио',
    dative: 'Токио',
  },
  manokwari: {
    nominative: 'Маноквари',
    genitive: 'Маноквари',
    dative: 'Маноквари',
  },
  perth: {
    nominative: 'Перт',
    genitive: 'Перта',
    dative: 'Перт',
  },
  sydney: {
    nominative: 'Сидней',
    genitive: 'Сиднея',
    dative: 'Сидней',
  },
  marrakesh: {
    nominative: 'Марракеш',
    genitive: 'Марракеша',
    dative: 'Марракеш',
  },
  alexandria: {
    nominative: 'Александрия',
    genitive: 'Александрии',
    dative: 'Александрию',
  },
  nairobi: {
    nominative: 'Найроби',
    genitive: 'Найроби',
    dative: 'Найроби',
  },
  lagos: {
    nominative: 'Лагос',
    genitive: 'Лагоса',
    dative: 'Лагос',
  },
  cairo: {
    nominative: 'Каир',
    genitive: 'Каира',
    dative: 'Каир',
  },
  stockholm: {
    nominative: 'Стокгольм',
    genitive: 'Стокгольма',
    dative: 'Стокгольм',
  },
};
