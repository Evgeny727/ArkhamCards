import React, { useCallback, useContext, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { forEach, map, sum } from 'lodash';
import { t } from 'ttag';

import CounterListItemComponent from './CounterListItemComponent';
import ScenarioGuideContext from '../../ScenarioGuideContext';
import { NumberChoices } from '@actions/types';
import { m } from '@styles/space';
import { Counters, useCounters } from '@components/core/hooks';
import StyleContext from '@styles/StyleContext';
import InputWrapper from '../InputWrapper';
import { CampaignInvestigator } from '@data/scenario/GuidedCampaignLog';

export interface CounterItem {
  code: string;
  investigator?: CampaignInvestigator;
  name: string;
  description?: string;
  color?: string;
  limit?: number;
  min?: number;
}

interface Props {
  id: string;
  items: CounterItem[];
  countText?: string;
  requiredTotal?: number;
  loading?: boolean;
  showDelta?: boolean;
  button?: React.ReactNode;
}

export default function CounterListComponent({ id, items, countText, requiredTotal, loading, showDelta, button }: Props) {
  const { scenarioState } = useContext(ScenarioGuideContext);
  const { colors, borderStyle } = useContext(StyleContext);
  const startingCounts = useMemo(() => {
    const counters: Counters = {};
    forEach(items, i => {
      counters[i.code] = i.min ? Math.max(0, i.min) : 0;
    });
    return counters;
  }, [items]);
  const [counts, onInc, onDec] = useCounters(startingCounts);

  const save = useCallback(async() => {
    const choices: NumberChoices = {};
    forEach(counts, (value, code) => {
      if (value !== undefined) {
        choices[code] = [value];
      }
    });
    await scenarioState.setNumberChoices(
      id,
      choices
    );
  }, [id, counts, scenarioState]);
  const choiceList = scenarioState.numberChoices(id);
  const hasDecision = choiceList !== undefined;

  const disabledText = useMemo(() => {
    if (hasDecision || !requiredTotal) {
      return undefined;
    }
    const currentTotal = sum(map(counts));
    if (currentTotal !== requiredTotal) {
      return currentTotal > requiredTotal ? t`Too many` : t`Not enough`;
    }
    return undefined;
  }, [hasDecision, requiredTotal, counts]);

  const getValue = useCallback((code: string): number => {
    if (choiceList === undefined) {
      return counts[code] || 0;
    }
    const investigatorCount = choiceList[code];
    if (!investigatorCount || !investigatorCount.length) {
      return 0;
    }
    return investigatorCount[0] || 0;
  }, [counts, choiceList]);
  return (
    <InputWrapper
      title={countText}
      onSubmit={save}
      disabledText={disabledText}
      buttons={!hasDecision && !!button ? button : undefined}
      editable={!hasDecision}
    >
      { loading ? (
        <View style={[styles.loadingRow, borderStyle]}>
          <ActivityIndicator size="small" animating color={colors.lightText} />
        </View>
      ) : map(items, ({ code, name, investigator, description, limit, min, color }, idx) => {
        const value = getValue(code);
        return (
          <CounterListItemComponent
            key={idx}
            investigator={investigator}
            value={value}
            code={code}
            name={name}
            description={description}
            onInc={onInc}
            onDec={onDec}
            max={limit}
            min={min}
            editable={!hasDecision}
            color={color}
            showDelta={!!showDelta}
          />
        );
      }) }
    </InputWrapper>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    padding: m,
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
