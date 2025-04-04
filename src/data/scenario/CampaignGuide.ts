import { find, findIndex, filter, flatMap, forEach, reverse, slice } from 'lodash';
import { ngettext, msgid, t } from 'ttag';

import { GuideStartCustomSideScenarioInput, OZ } from '@actions/types';
import { PlayedScenario, ProcessedCampaign, ProcessedScenario, ScenarioId } from '@data/scenario';
import { createInvestigatorStatusStep, PLAY_SCENARIO_STEP_ID, PROCEED_STEP_ID, UPGRADE_DECKS_STEP_ID } from './fixedSteps';
import GuidedCampaignLog from './GuidedCampaignLog';
import CampaignStateHelper from './CampaignStateHelper';
import ScenarioStateHelper from './ScenarioStateHelper';
import ScenarioGuide from './ScenarioGuide';
import { FullCampaign, Scenario, Supply, Errata, CardErrata, Question, Achievement, Partner, CampaignMap, CampaignRule } from './types';
import deepEqual from 'deep-equal';
import stable from 'stable';

type CampaignLogEntry = {
  id: string;
  text: string;
} | {
  id: string;
  text: undefined;
  masculine_text: string;
  feminine_text: string;
  nonbinary_text: string;
};

export interface CampaignLogSection {
  section: string;
  entries: CampaignLogEntry[];
}
export interface CampaignLog {
  campaignId: string;
  sections: CampaignLogSection[];
  supplies: Supply[];
}

interface LogSection {
  section: string;
}

export interface LogEntryCard extends LogSection {
  type: 'card';
  code: string;
}

interface LogEntrySectionCount extends LogSection {
  type: 'section_count';
}

export interface LogEntryText extends LogSection {
  type: 'text';
  text: string;
  feminineText?: string;
  nonbinaryText?: string;
}

interface LogEntrySupplies extends LogSection {
  type: 'supplies';
  supply: Supply;
}

interface LogEntryInvestigatorCount extends LogSection {
  type: 'investigator_count';
}

interface UnprocessedScenario {
  id: ScenarioId;
  scenario: Scenario;
  side: boolean;
}

type LogEntry = LogEntrySectionCount | LogEntryCard | LogEntryText | LogEntrySupplies | LogEntryInvestigatorCount;
export const CARD_REGEX = /\d\d\d\d\d[a-z]?/;
export const CAMPAIGN_SETUP_ID = '$campaign_setup';

export class CampaignUpdateRequiredError implements Error {
  name = 'CampaignUpdateRequiredError';
  message: string;

  constructor() {
    this.message = t`An app update is required to access this campaign.`;
  }
}

/**
 * Wrapper utility to provide structured access to campaigns.
 */
export default class CampaignGuide {
  private campaign: FullCampaign;
  private log: CampaignLog;
  private encounterSets: { [code: string]: string };

  private sideCampaign: FullCampaign;
  private errata: Errata;

  constructor(
    campaign: FullCampaign,
    log: CampaignLog,
    encounterSets: { [code: string]: string},
    sideCampaign: FullCampaign,
    errata: Errata
  ) {
    this.campaign = campaign;
    this.log = log;
    this.encounterSets = encounterSets;
    this.sideCampaign = sideCampaign;
    this.errata = errata;
  }

  cardErrata(encounterSets: string[]): CardErrata[] {
    const sets = new Set(encounterSets);
    return flatMap(this.errata.cards, errata => {
      if (sets.has(errata.encounter_code)) {
        return errata.cards;
      }
      return [];
    });
  }

  includeParallelInvestigators() {
    return this.campaignCycleCode() === OZ;
  }

  scenarioSetupStepIds(): string[] {
    return this.campaign.campaign.scenario_setup || [];
  }
  sideScenarioResolutionStepIds(): string[] {
    return this.campaign.campaign.side_scenario_resolution || [];
  }

  tarotScenarios(): string[] | undefined {
    return this.campaign.campaign.tarot;
  }

  campaignFaq(): Question[] {
    const campaignFaq = find(this.errata.campaign_faq ?? [], faq => faq.cycles.includes(this.campaign.campaign.id))
    return campaignFaq?.questions ?? [];
  }

  scenarioFaq(scenario: string): Question[] {
    const scenarioFaq = find(this.errata.faq, faq => faq.scenario_code === scenario && (
      !faq.campaign_code || faq.campaign_code === this.campaign.campaign.id
    ));
    return scenarioFaq?.questions ?? [];
  }

  campaignRules(lang: string): CampaignRule[] {
    return stable(this.campaign.campaign.rules ?? [], (a, b) => a.title.localeCompare(b.title, lang));
  }

  scenarioRules(lang: string, scenario: string | undefined): CampaignRule[] {
    if (!scenario || scenario === CAMPAIGN_SETUP_ID) {
      return this.campaignRules(lang);
    }
    return stable(
      [
        ...this.campaignRules(lang),
        ...this.campaign.scenarios.find(s => s.id === scenario)?.rules ?? [],
      ],
      (a, b) => a.title.localeCompare(b.title, lang)
    );
  }

  campaignMap(): CampaignMap | undefined {
    return this.campaign.campaign.map;
  }

  sideScenarios(): Scenario[] {
    return flatMap(
      this.sideCampaign.campaign.scenarios,
      scenarioId => find(this.sideCampaign.scenarios, scenario => scenario.id === scenarioId) || []
    );
  }

  card(code: string): { code: string; name: string; gender?: 'm' | 'f' | 'nb'; description?: string; img?: string } | undefined {
    return find(this.campaign.campaign.cards, c => c.code === code);
  }

  achievements(): Achievement[] {
    return this.campaign.campaign.achievements || [];
  }

  campaignCycleCode() {
    return this.campaign.campaign.id;
  }

  campaignCustomData() {
    return this.campaign.campaign.custom;
  }

  campaignName() {
    return this.campaign.campaign.name;
  }

  campaignNoSideScenarioXp() {
    return !!this.campaign.campaign.no_side_scenario_xp;
  }

  campaignVersion() {
    return this.campaign.campaign.version;
  }

  encounterSet(code: string): string | undefined {
    return this.encounterSets[code];
  }

  getFullScenarioName(
    encodedScenarioId: string
  ): string | undefined {
    const scenarioId = this.parseScenarioId(encodedScenarioId);
    const scenario = find(
      this.campaign.scenarios,
      scenario => scenario.id === scenarioId.scenarioId
    );
    return scenario && scenario.full_name;
  }

  findScenarioData(
    id: string
  ): Scenario | undefined {
    return find(
      this.campaign.scenarios,
      scenario => scenario.id === id
    );
  }

  campaignLogSections() {
    return this.campaign.campaign.campaign_log;
  }

  campaignLogPartners(sectionId: string): Partner[] {
    const section = find(this.campaignLogSections(), s => s.id === sectionId && s.type === 'partner');
    if (section?.type !== 'partner') {
      return [];
    }
    return section.partners || [];
  }

  prologueScenarioId(scenarios: string[] | undefined): string {
    return (scenarios || this.campaign.campaign.scenarios)[0];
  }

  processAllScenarios(
    campaignState: CampaignStateHelper,
    standaloneId: string | undefined,
    previousCampaign: ProcessedCampaign | undefined,
    lang: string
  ): [ProcessedCampaign | undefined, string | undefined] {
    try {
      const scenarios: ProcessedScenario[] = [];
      let campaignLog: GuidedCampaignLog = new GuidedCampaignLog(
        [],
        this,
        campaignState,
        !!standaloneId,
      );
      if (standaloneId) {
        const scenario = this.findScenario(standaloneId);
        const nextScenarios = this.actuallyProcessScenario(
          scenario,
          campaignState,
          campaignLog,
          true,
          previousCampaign,
          lang
        );
        forEach(nextScenarios, scenario => {
          scenarios.push(scenario);
          campaignLog = scenario.latestCampaignLog;
        });
      } else {
        const setupScenario = this.findScenario(CAMPAIGN_SETUP_ID);
        const nextScenarios = this.actuallyProcessScenario(
          setupScenario,
          campaignState,
          campaignLog,
          false,
          previousCampaign,
          lang
        );
        forEach(nextScenarios, scenario => {
          scenarios.push(scenario);
          campaignLog = scenario.latestCampaignLog;
        });
      }

      const scenarioIds = campaignLog.campaignData.scenarios || this.campaign.campaign.scenarios;
      forEach(scenarioIds, scenarioId => {
        if (!find(scenarios, scenario => scenario.scenarioGuide.id === scenarioId)) {
          const scenario = this.findScenario(scenarioId);
          const nextScenarios = this.actuallyProcessScenario(
            scenario,
            campaignState,
            campaignLog,
            !!standaloneId,
            previousCampaign,
            lang
          );
          forEach(nextScenarios, scenario => {
            scenarios.push(scenario);
            campaignLog = scenario.latestCampaignLog;
          });
        }
      });
      let foundPlayable = false;
      forEach(scenarios, scenario => {
        if (scenario.type === 'playable') {
          if (foundPlayable) {
            scenario.type = 'locked';
          } else {
            foundPlayable = true;
          }
        }
        if (scenario.type === 'started') {
          foundPlayable = true;
        }
      });
      let foundUndoable = false;
      forEach(reverse(slice(scenarios)), scenario => {
        if (scenario.canUndo) {
          if (foundUndoable) {
            scenario.canUndo = false;
          } else {
            foundUndoable = true;
          }
        }
      });
      return [{
        scenarios,
        campaignLog,
      }, undefined];
    } catch (e) {
      console.log(e.message);
      return [undefined, e.message];
    }
  }

  nextScenario(
    campaignState: CampaignStateHelper,
    campaignLog: GuidedCampaignLog,
    includeSkipped: boolean
  ): UnprocessedScenario | undefined {
    if (!campaignLog.scenarioId) {
      return this.findScenario(CAMPAIGN_SETUP_ID);
    }
    const parsedId = this.parseScenarioId(campaignLog.scenarioId);
    const entry = campaignState.sideScenario(parsedId.encodedScenarioId);
    if (entry) {
      const scenario = (entry.sideScenarioType === 'custom') ?
        this.getCustomScenario(entry) :
        find(
          this.sideCampaign.scenarios,
          scenario => scenario.id === entry.scenario
        );
      if (!scenario) {
        throw new CampaignUpdateRequiredError();
      }
      return {
        id: this.parseScenarioId(entry.scenario),
        scenario: this.insertCustomPlayScenarioStep(scenario),
        side: true,
      };
    }

    const campaignNextScenarioId = campaignLog.campaignNextScenarioId();
    if (campaignNextScenarioId) {
      return this.findScenario(campaignNextScenarioId);
    }

    const scenarios = filter(
      this.allScenarioIds(campaignLog.campaignData.scenarios),
      scenarioId => includeSkipped || campaignLog.scenarioStatus(scenarioId) !== 'skipped'
    );
    const currentIndex = findIndex(
      scenarios,
      scenarioId => scenarioId === parsedId.scenarioId
    );
    if (currentIndex !== -1 && currentIndex + 1 < scenarios.length) {
      return this.findScenario(scenarios[currentIndex + 1]);
    }
    return undefined;
  }

  private findScenario(encodedScenarioId: string): UnprocessedScenario {
    if (encodedScenarioId === CAMPAIGN_SETUP_ID) {
      return {
        id: this.parseScenarioId(CAMPAIGN_SETUP_ID),
        scenario: {
          id: CAMPAIGN_SETUP_ID,
          type: 'interlude',
          icon: this.campaign.campaign.id,
          scenario_name: t`Campaign Setup`,
          full_name: t`Campaign Setup`,
          header: '',
          setup: this.campaign.campaign.setup,
          steps: this.campaign.campaign.steps,
        },
        side: false,
      };
    }
    const id = this.parseScenarioId(encodedScenarioId);
    const mainScenario = find(this.campaign.scenarios, scenario => scenario.id === id.scenarioId);
    if (mainScenario) {
      return {
        id,
        scenario: mainScenario,
        side: false,
      };
    }
    const sideScenario = find(this.sideCampaign.scenarios, scenario => scenario.id === id.scenarioId);
    if (sideScenario) {
      return {
        id,
        scenario: sideScenario,
        side: true,
      };
    }
    throw new CampaignUpdateRequiredError();
  }

  parseScenarioId(encodedScenarioId: string): ScenarioId {
    if (encodedScenarioId.indexOf('#') === -1) {
      return {
        encodedScenarioId,
        scenarioId: encodedScenarioId,
        replayAttempt: undefined,
      };
    }
    const [scenarioId, replayCount] = encodedScenarioId.split('#');
    return {
      encodedScenarioId,
      scenarioId,
      replayAttempt: parseInt(replayCount, 10),
    };
  }

  nextScenarioName(
    campaignState: CampaignStateHelper,
    campaignLog: GuidedCampaignLog
  ): string | undefined {
    const scenario = this.nextScenario(campaignState, campaignLog, false);
    if (!scenario) {
      return undefined;
    }
    return scenario.scenario.full_name;
  }

  private actuallyProcessScenario(
    { id, scenario, side }: UnprocessedScenario,
    campaignState: CampaignStateHelper,
    campaignLog: GuidedCampaignLog,
    standalone: boolean | undefined,
    previousCampaign: ProcessedCampaign | undefined,
    lang: string
  ): ProcessedScenario[] {
    const scenarioGuide = new ScenarioGuide(
      id.encodedScenarioId,
      scenario,
      side,
      this,
      campaignLog,
      !!standalone
    );
    if (!campaignState.startedScenario(id.encodedScenarioId)) {
      if (
        (campaignLog.campaignData.result === 'lose' && scenarioGuide.scenarioType() !== 'epilogue') ||
        campaignLog.scenarioStatus(id.encodedScenarioId) === 'skipped'
      ) {
        return [{
          type: 'skipped',
          id,
          scenarioGuide,
          latestCampaignLog: campaignLog,
          canUndo: false,
          closeOnUndo: false,
          steps: [],
        }];
      }
      return [{
        type: scenarioGuide.scenarioType() === 'placeholder' ? 'placeholder' : 'playable' ,
        id,
        location: scenario.main_scenario_id ? campaignState.sideScenarioEmbarkData(scenario.main_scenario_id)?.destination : undefined,
        scenarioGuide,
        latestCampaignLog: campaignLog,
        canUndo: false,
        closeOnUndo: false,
        steps: [],
      }];
    }
    const previousScenario = find(previousCampaign?.scenarios, scenario => scenario.id.encodedScenarioId === id.encodedScenarioId);
    const inputs = [
      ...campaignState.scenarioEntries(id),
      ...campaignState.linkedEntries(),
    ];
    let firstResult: PlayedScenario | undefined = undefined;
    if (previousScenario &&
      (previousScenario.type === 'completed' || previousScenario.type === 'started') &&
      deepEqual(inputs, previousScenario.inputs)
    ) {
      // We have equality on all inputs that can dictate flow, so short circuit into using the previous result.
      firstResult = {
        ...previousScenario,
        canUndo: true,
      };
    } else {
      const scenarioState = new ScenarioStateHelper(id.encodedScenarioId, campaignState);
      const executedScenario = scenarioGuide.setupSteps(scenarioState, standalone);
      firstResult = {
        type: executedScenario.inProgress ? 'started' : 'completed',
        location: campaignState.sideScenarioEmbarkData(scenario.main_scenario_id || id.encodedScenarioId)?.destination,
        id,
        scenarioGuide,
        latestCampaignLog: executedScenario.latestCampaignLog,
        canUndo: true,
        closeOnUndo: campaignState.closeOnUndo(id.encodedScenarioId),
        steps: executedScenario.steps,
        inputs,
        rules: stable(
          [
            ...campaignLog.campaignGuide.campaign.campaign.rules ?? [],
            ...scenario.rules ?? [],
          ],
          (a, b) => a.title.localeCompare(b.title, lang),
        ),
      };
    }
    if (!firstResult) {
      return [];
    }
    if (firstResult.type === 'started') {
      return [firstResult];
    }
    const latestCampaignLog = firstResult.latestCampaignLog;
    const nextScenario = this.nextScenario(
      campaignState,
      latestCampaignLog,
      true
    );
    if (!nextScenario) {
      return [firstResult];
    }
    return [
      firstResult,
      ...this.actuallyProcessScenario(
        nextScenario,
        campaignState,
        latestCampaignLog,
        standalone,
        previousCampaign,
        lang,
      ),
    ];
  }

  private getCustomScenario(
    entry: GuideStartCustomSideScenarioInput
  ): Scenario {
    return {
      id: entry.scenario,
      scenario_name: entry.name,
      full_name: entry.name,
      header: '',
      setup: [
        'spend_xp_cost',
        ...this.scenarioSetupStepIds(),
        PLAY_SCENARIO_STEP_ID,
        '$end_of_scenario_status',
        '$earn_xp',
        UPGRADE_DECKS_STEP_ID,
        ...this.sideScenarioResolutionStepIds(),
        PROCEED_STEP_ID,
      ],
      steps: [
        createInvestigatorStatusStep('$end_of_scenario_status'),
        {
          id: '$earn_xp',
          text: t`Each investigator earns experience equal to the Victory X value of each card in the victory display.`,
          type: 'input',
          input: {
            type: 'counter',
            text: t`Victory display:`,
            effects: [
              {
                type: 'earn_xp',
                investigator: 'all',
              },
            ],
          },
        },
        {
          id: PLAY_SCENARIO_STEP_ID,
          type: 'input',
          input: {
            type: 'play_scenario',
            no_resolutions: true,
          },
        },
        {
          id: 'spend_xp_cost',
          text: ngettext(
            msgid`Each investigator pays ${entry.xpCost} experience point to play this scenario.`,
            `Each investigator pays ${entry.xpCost} experience points to play this scenario.`,
            entry.xpCost
          ),
          effects: [
            {
              type: 'earn_xp',
              investigator: 'all',
              bonus: -entry.xpCost,
              side_scenario_cost: true,
            },
          ],
        },
      ],
    };
  }

  private insertCustomPlayScenarioStep(
    scenario: Scenario
  ): Scenario {
    const campaignPlayScenarioStep = find(
      this.campaign.campaign.side_scenario_steps,
      step => step.id === PLAY_SCENARIO_STEP_ID
    );
    if (!campaignPlayScenarioStep ||
      campaignPlayScenarioStep.type !== 'input' ||
      campaignPlayScenarioStep.input.type !== 'play_scenario'
    ) {
      return scenario;
    }
    const scenarioPlayScenarioStep = find(
      scenario.steps,
      step => step.id === PLAY_SCENARIO_STEP_ID
    );
    if (!scenarioPlayScenarioStep ||
      scenarioPlayScenarioStep.type !== 'input' ||
      scenarioPlayScenarioStep.input.type !== 'play_scenario'
    ) {
      return {
        ...scenario,
        steps: [
          ...this.campaign.campaign.side_scenario_steps || [],
          ...scenario.steps,
        ],
      };
    }

    return {
      ...scenario,
      steps: [
        ...filter(this.campaign.campaign.side_scenario_steps, step => step.id !== PLAY_SCENARIO_STEP_ID),
        ...filter(scenario.steps, step => step.id !== PLAY_SCENARIO_STEP_ID),
        {
          id: PLAY_SCENARIO_STEP_ID,
          type: 'input',
          input: {
            type: 'play_scenario',
            no_resolutions: scenarioPlayScenarioStep.input.no_resolutions,
            branches: [
              ...(campaignPlayScenarioStep.input.branches || []),
              ...(scenarioPlayScenarioStep.input.branches || []),
            ],
            campaign_log: [
              ...(campaignPlayScenarioStep.input.campaign_log || []),
              ...(scenarioPlayScenarioStep.input.campaign_log || []),
            ],
          },
        },
      ],
    };
  }

  private allScenarioIds(scenarios: string[] | undefined) {
    return [
      CAMPAIGN_SETUP_ID,
      ...(scenarios || this.campaign.campaign.scenarios),
    ];
  }

  scenarioName(scenarioId: string): string | undefined {
    const scenario = find(this.campaign.scenarios, scenario => scenario.id === scenarioId);
    return scenario && scenario.scenario_name;
  }

  logSection(sectionId: string): LogSection | undefined {
    const section = find(
      this.campaign.campaign.campaign_log,
      logSection => logSection.id === sectionId
    );
    if (!section) {
      return undefined;
    }
    return {
      section: section.title,
    };
  }

  logEntry(sectionId: string, id: string, hack?: boolean): LogEntry {
    const section = find(
      this.campaign.campaign.campaign_log,
      logSection => logSection.id === sectionId
    );
    if (!section) {
      throw new Error(`Could not find section: ${sectionId}`);
    }
    if (section.type === 'supplies') {
      const supply = find(this.log.supplies, s => s.id === id);
      if (!supply) {
        throw new Error(`Could not find Supply: ${id}`);
      }
      return {
        type: 'supplies',
        section: section.title,
        supply,
      };
    }
    if (section.type === 'investigator_count' && !hack) {
      return {
        type: 'investigator_count',
        section: section.title,
      }
    }
    if (id === '$count') {
      return {
        type: 'section_count',
        section: section.title,
      };
    }
    const textSection = find(
      this.log.sections,
      s => s.section === sectionId
    );

    if (id.match(CARD_REGEX)) {
      return {
        type: 'card',
        section: section.title,
        code: id,
      };
    }

    if (textSection) {
      if (id === '$num_entries') {
        return {
          type: 'section_count',
          section: section.title,
        };
      }
      const entry = find(
        textSection.entries,
        entry => entry.id === id
      );
      if (entry) {
        if (entry.text === undefined) {
          return {
            type: 'text',
            section: section.title,
            text: entry.masculine_text,
            feminineText: entry.feminine_text,
            nonbinaryText: entry.nonbinary_text,
          };
        }
        return {
          type: 'text',
          section: section.title,
          text: entry.text,
        };
      }
    }

    // Try input value?
    if (sectionId !== '$input_value') {
      try {
        const entry = this.logEntry('$input_value', id);
        if (entry) {
          return {
            ...entry,
            section: sectionId,
          };
        }
      } catch (e) {
        throw new Error(`Could not find section(${sectionId}), id(${id}), textSection(${JSON.stringify(textSection)}), checked input value too`);
      }
    }
    throw new Error(`Could not find section(${sectionId}), id(${id}), textSection(${JSON.stringify(textSection)})`);
  }
}
