import {
  NumberChoices,
  StringChoices,
  SupplyCounts,
  InvestigatorTraumaData,
  DeckId,
  DelayedDeckEdits,
  EmbarkData,
} from '@actions/types';
import CampaignStateHelper from './CampaignStateHelper';

export default class ScenarioStateHelper {
  scenarioId: string;
  campaignState: CampaignStateHelper;

  constructor(scenarioId: string, campaignState: CampaignStateHelper) {
    this.scenarioId = scenarioId;
    this.campaignState = campaignState;
  }

  setChoice(id: string, value: number) {
    this.campaignState.setChoice(id, value, this.scenarioId);
  }

  choice(id: string): number | undefined {
    return this.campaignState.choice(id, this.scenarioId);
  }

  setText(id: string, value: string, inputId: string | undefined) {
    this.campaignState.setText(id, value, this.scenarioId, inputId);
  }

  text(id: string): string | undefined {
    return this.campaignState.text(id, this.scenarioId);
  }

  setNumberChoices(id: string, value: NumberChoices, deckId?: DeckId, deckEdits?: DelayedDeckEdits) {
    return this.campaignState.setNumberChoices(id, value, deckId, deckEdits, this.scenarioId);
  }

  numberChoices(id: string): NumberChoices | undefined {
    return this.campaignState.numberChoices(id, this.scenarioId)[0];
  }

  numberAndDeckChoices(id: string): [NumberChoices | undefined, DeckId | undefined, DelayedDeckEdits | undefined] {
    return this.campaignState.numberChoices(id, this.scenarioId);
  }

  setStringChoices(id: string, value: StringChoices) {
    this.campaignState.setStringChoices(id, value, this.scenarioId);
  }

  stringChoices(id: string): StringChoices | undefined {
    return this.campaignState.stringChoices(id, this.scenarioId);
  }

  setSupplies(id: string, value: SupplyCounts) {
    this.campaignState.setSupplies(id, value, this.scenarioId);
  }

  supplies(id: string): SupplyCounts | undefined {
    return this.campaignState.supplies(id, this.scenarioId);
  }

  setDecision(id: string, value: boolean) {
    this.campaignState.setDecision(id, value, this.scenarioId);
  }

  decision(id: string): boolean | undefined {
    return this.campaignState.decision(id, this.scenarioId);
  }

  setCount(id: string, value: number) {
    this.campaignState.setCount(id, value, this.scenarioId);
  }

  count(id: string): number | undefined {
    return this.campaignState.count(id, this.scenarioId);
  }

  campaignLink(sendOrReceive: 'send' | 'receive', id: string): string | undefined {
    return this.campaignState.campaignLink(sendOrReceive, id, this.scenarioId);
  }

  interScenarioInvestigatorData(): InvestigatorTraumaData | undefined {
    return this.campaignState.interScenarioInvestigatorData(this.scenarioId);
  }

  interScenarioCampaignLogEntries(): string[] | undefined {
    return this.campaignState.interScenarioCampaignLogEntries(this.scenarioId);
  }

  embarkData(): EmbarkData | undefined {
    return this.campaignState.scenarioEmbarkData(this.scenarioId);
  }
  arriveData(): EmbarkData | undefined {
    return this.campaignState.scenarioArriveData(this.scenarioId);
  }

  setCampaignLink(id: string, decision: string) {
    this.campaignState.setCampaignLink(
      id,
      decision,
      this.scenarioId
    );
  }

  undo() {
    this.campaignState.undo(this.scenarioId);
  }
}
