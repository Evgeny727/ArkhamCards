import React, { useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { head } from 'lodash';
import { t } from 'ttag';

import EncounterIcon from '@icons/EncounterIcon';
import NavButton from '@components/core/NavButton';
import { ChallengeData, CustomData, Scenario } from '@data/scenario/types';
import space, { s, m } from '@styles/space';
import StyleContext from '@styles/StyleContext';
import useSingleCard from '@components/card/useSingleCard';
import { useNavigation } from '@react-navigation/native';

interface Props {
  scenario: Scenario;
  onPress: (scenario: Scenario) => void;
  useTime: boolean;
}

function ChallengeBlock({ scenario, challenge, useTime }: { scenario: Scenario; challenge: ChallengeData; useTime: boolean }) {
  const { typography } = useContext(StyleContext);
  const [investigatorCard] = useSingleCard(challenge.investigator, 'player');
  const [playerCard] = useSingleCard(head(challenge.card_discount), 'player');
  const investigator = investigatorCard ?? playerCard;

  if (!investigator) {
    return null;
  }
  const xpCost = scenario.xp_cost || 0;
  const additionalXpCost = challenge.xp_cost;
  const challengeCost = xpCost + additionalXpCost;
  const basicXpCost = xpCost;
  const challengeDiscountCost = xpCost + additionalXpCost;
  return (
    <View style={styles.flex}>
      <Text style={[typography.small, space.paddingTopS]}>
        { scenario.custom ?
          t`${investigator.name} Fan-Made Challenge Scenario by ${scenario.custom.creator}` :
          t`${investigator.name} Challenge Scenario`
        }
      </Text>
      { !!investigatorCard ? (
        <>
          { useTime ? (
            <>
              <Text style={[typography.small, typography.light, space.paddingTopS]}>
                { t`Time cost: ${xpCost}` }
              </Text>
              <Text style={[typography.small, typography.light, space.paddingTopS]}>
                { t`Additional experience cost for ${investigator.name}: ${additionalXpCost}` }
              </Text>
            </>
          ) : (
            <Text style={[typography.small, typography.light, space.paddingTopS]}>
              { t`Experience cost: ${challengeCost} for ${investigator.name}, ${xpCost} for each other investigator` }
            </Text>
          ) }
        </>
      ) : (
        <>
          { useTime ? (
            <>
              <Text style={[typography.small, typography.light, space.paddingTopS]}>
                { t`Time cost: ${xpCost}` }
              </Text>
              <Text style={[typography.small, typography.light, space.paddingTopS]}>
                { t`Additional experience cost for ${investigator.name}: ${additionalXpCost}` }
              </Text>
            </>
          ) : (
            <Text style={[typography.small, typography.light, space.paddingTopS]}>
              { t`Experience cost: ${basicXpCost} for decks that include ${investigator.name}, ${challengeDiscountCost} for each other player` }
            </Text>
          ) }
        </>
      )}
    </View>
  );
}

function CustomBlock({ scenario, custom, useTime }: { scenario: Scenario; custom: CustomData; useTime: boolean }) {
  const { typography } = useContext(StyleContext);
  const xpCost = scenario.xp_cost || 0;
  return (
    <View style={styles.flex}>
      <Text style={[typography.small, space.paddingTopS]}>
        { t`Fan-made scenario by ${custom.creator}` }
      </Text>
      <Text style={[typography.small, typography.light, space.paddingTopS]}>
        { useTime ? t`Time cost: ${xpCost}` : t`Experience cost: ${xpCost}` }
      </Text>
    </View>
  );
}
export default function SideScenarioButton({ scenario, onPress, useTime }: Props) {
  const { typography, colors } = useContext(StyleContext);
  const navigation = useNavigation();
  const _onPress = () => {
    onPress(scenario);
  };

  const _onPressChallenge = () => {
    if (scenario.challenge) {
      navigation.navigate('Guide.ChallengeScenario', {
        scenario,
        challenge: scenario.challenge,
        onPress,
        title: scenario.scenario_name,
      });
    }
  };
  const xpCost = scenario.xp_cost || 0;
  const descriptionLine = useMemo(() => {
    if (scenario.side_scenario_type === 'challenge' && !!scenario.challenge) {
      return (
        <ChallengeBlock challenge={scenario.challenge} scenario={scenario} useTime={useTime} />
      );
    }
    if (scenario.custom) {
      return (
        <CustomBlock custom={scenario.custom} scenario={scenario} useTime={useTime} />
      );
    }
    return (
      <Text style={[typography.small, typography.light, space.paddingTopS]}>
        { useTime ? t`Time cost: ${xpCost}` : t`Experience cost: ${xpCost}` }
      </Text>
    );
  }, [xpCost, scenario, typography, useTime]);
  return (
    <NavButton
      onPress={scenario.side_scenario_type === 'challenge' && scenario.challenge ? _onPressChallenge : _onPress}
    >
      <View style={[styles.row, space.paddingTopS, space.paddingBottomS]}>
        <View style={styles.icon}>
          <EncounterIcon
            encounter_code={scenario.id}
            size={28}
            color={colors.darkText}
          />
        </View>
        <View style={styles.column}>
          <Text style={typography.text}>
            { scenario.full_name }
          </Text>
          { descriptionLine }
        </View>
      </View>
    </NavButton>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  column: {
    flexDirection: 'column',
    flex: 1,
  },
  icon: {
    marginLeft: s,
    marginRight: m,
    width: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
