import React, { useCallback, useContext, useMemo } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { filter } from 'lodash';
import { t } from 'ttag';

import LocationSetupButton from './LocationSetupButton';
import TableStepComponent from './TableStepComponent';
import EffectsStepComponent from './EffectsStepComponent';
import ResolutionStepComponent from './ResolutionStepComponent';
import CampaignGuideContext from '../CampaignGuideContext';
import { CHOOSE_RESOLUTION_STEP_ID, PROCEED_ALT_STEP_ID, PROCEED_STEP_ID } from '@data/scenario/fixedSteps';
import ScenarioStepContext, { ScenarioStepContextType } from '../ScenarioStepContext';
import XpCountComponent from './XpCountComponent';
import BranchStepComponent from './BranchStepComponent';
import EncounterSetStepComponent from './EncounterSetStepComponent';
import LocationConnectorsStepComponent from './LocationConnectorsStepComponent';
import GenericStepComponent from './GenericStepComponent';
import InputStepComponent from './InputStepComponent';
import RuleReminderStepComponent from './RuleReminderStepComponent';
import StoryStepComponent from './StoryStepComponent';
import ScenarioStep from '@data/scenario/ScenarioStep';
import space, { m, s } from '@styles/space';
import NarrationStepComponent from './NarrationStepComponent';
import ScenarioGuideContext from '../ScenarioGuideContext';
import ActionButton from '../prompts/ActionButton';
import BorderStepComponent from './BorderStepComponent';
import TitleComponent from './TitleComponent';
import TravelCostStepComponent from './TravelCostStepComponent';
import { BorderColor } from '@data/scenario/types';
import InvestigatorSetupComponent from './InvestigatorSetupComponent';
import { useNavigation } from '@react-navigation/native';

interface Props {
  step: ScenarioStep;
  width: number;
  border?: boolean;
  color?: BorderColor;
  noTitle?: boolean;
  switchCampaignScenario?: () => void;
}


function ScenarioStepComponentContent({
  step: { step, campaignLog },
  border,
  width,
  color,
  switchCampaignScenario,
}: Props) {
  const { campaignGuide } = useContext(CampaignGuideContext);
  const { processedScenario, scenarioState } = useContext(ScenarioGuideContext);
  if (step.border_only && !border) {
    return null;
  }
  if (!step.type) {
    return (
      <NarrationStepComponent narration={step.narration} hideTitle={!!step.title}>
        <GenericStepComponent step={step} color={color} />
      </NarrationStepComponent>
    );
  }
  switch (step.type) {
    case 'table':
      return (
        <TableStepComponent step={step} />
      );
    case 'branch':
      return (
        <NarrationStepComponent narration={step.narration} hideTitle={!!step.title}>
          <BranchStepComponent
            step={step}
            color={color}
            campaignLog={campaignLog}
          />
        </NarrationStepComponent>
      );
    case 'story':
      return (
        <NarrationStepComponent narration={step.narration} hideTitle={!!step.title}>
          <View style={border && !step.title ? styles.extraTopPadding : {}}>
            <StoryStepComponent
              step={step}
              width={width}
            />
          </View>
        </NarrationStepComponent>
      );
    case 'encounter_sets':
      return (
        <EncounterSetStepComponent
          step={step}
          campaignGuide={campaignGuide}
          color={color}
        />
      );
    case 'travel_cost':
      return (
        <TravelCostStepComponent campaignGuide={campaignGuide} />
      );
    case 'location_connectors':
      return <LocationConnectorsStepComponent step={step} />;
    case 'rule_reminder':
      return <RuleReminderStepComponent step={step} width={width} />;
    case 'resolution':
      return <ResolutionStepComponent step={step} />;
    case 'xp_count':
      return (
        <XpCountComponent
          step={step}
          campaignLog={campaignLog}
        />
      );
    case 'investigator_setup':
      return (
        <InvestigatorSetupComponent
          step={step}
          campaignLog={campaignLog}
        />
      );
    case 'input':
      return (
        <NarrationStepComponent narration={step.narration} hideTitle={!!step.title}>
          <InputStepComponent
            step={step}
            campaignLog={campaignLog}
            switchCampaignScenario={switchCampaignScenario}
            color={color}
            border={border}
          />
        </NarrationStepComponent>
      );
    case 'effects':
      return (
        <EffectsStepComponent
          width={width}
          step={step}
          campaignLog={campaignLog}
          switchCampaignScenario={switchCampaignScenario}
        />
      );
    case 'location_setup':
      return (
        <View style={space.paddingBottomM}>
          <LocationSetupButton step={step} />
        </View>
      );
    case 'border':
      return (
        <BorderStepComponent
          step={step}
          width={width}
          processedScenario={processedScenario}
          campaignLog={campaignLog}
          scenarioState={scenarioState}
          switchCampaignScenario={switchCampaignScenario}
        />
      );
    default:
      return null;
  }
}

export default function ScenarioStepComponent({
  step,
  width,
  border,
  color,
  noTitle,
  switchCampaignScenario,
}: Props) {
  const navigation = useNavigation();
  const { campaignInvestigators } = useContext(CampaignGuideContext);
  const { processedScenario } = useContext(ScenarioGuideContext);

  const context: ScenarioStepContextType = useMemo(() => {
    const safeCodes = new Set(step.campaignLog.investigatorCodesSafe());
    const investigators = filter(
      campaignInvestigators,
      investigator => safeCodes.has(investigator.code)
    );
    return {
      campaignLog: step.campaignLog,
      scenarioInvestigators: investigators,
    };
  }, [step.campaignLog, campaignInvestigators]);
  const resolution = step.step.id === CHOOSE_RESOLUTION_STEP_ID || context.campaignLog.scenarioStatus(processedScenario.id.encodedScenarioId) === 'resolution';
  const proceed = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  return (
    <ScenarioStepContext.Provider value={context}>
      { !noTitle && !!step.step.title && step.step.type !== 'border' && step.step.type !== 'xp_count' && (
        <TitleComponent
          title={step.step.title}
          simpleTitleFont={step.step.type === 'story' && step.step.title_font === 'status'}
          border_color={(step.step.type === 'story' && step.step.border_color) || (resolution ? 'resolution' : 'setup')}
          center={border}
        />
      ) }
      <ScenarioStepComponentContent
        step={step}
        border={border}
        width={width}
        switchCampaignScenario={switchCampaignScenario}
        color={color}
      />
      { (step.step.id === PROCEED_STEP_ID || step.step.id === PROCEED_ALT_STEP_ID) && (
        <View style={space.paddingS}>
          <ActionButton
            leftIcon="check"
            onPress={proceed}
            color="light"
            title={t`Done`}
          />
        </View>
      ) }
    </ScenarioStepContext.Provider>
  );
}

const styles = StyleSheet.create({
  extraTopPadding: {
    paddingTop: m + s,
  },
});
