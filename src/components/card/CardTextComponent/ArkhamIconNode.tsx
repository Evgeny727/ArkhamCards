import React from 'react';
import { Platform, View } from 'react-native';
import { MarkdownText, Node, OutputFunction, RenderState } from 'react-native-markdown-view';

import { ArkhamSlimIcon } from '@icons/ArkhamIcon';

import { WithIconName, State } from './types';
import { StyleContextType } from '@styles/StyleContext';
import EncounterIcon from '@icons/EncounterIcon';
import LocationConnectorIcon from '@icons/LocationConnectorIcon';
import { s } from '@styles/space';
import { MAX_WIDTH } from '@styles/sizes';

const BAD_ICON_NAMES: { [key: string]: string | undefined} = {
  Action: 'action',
  'per investigator': 'per_investigator',
  lightning: 'free',
  lighting: 'free',
  fast: 'free',
  will: 'willpower',
  willlpower: 'willpower',
  'auto-fail': 'auto_fail',
  autofail: 'auto_fail',
};

const ALL_ICONS = new Set([
  'guardian',
  'seeker',
  'mystic',
  'rogue',
  'survivor',
  'neutral',
  'willpower',
  'intellect',
  'combat',
  'agility',
  'wild',
  'elder_sign',
  'neutral',
  'skull',
  'cultist',
  'tablet',
  'elder_thing',
  'auto_fail',
  'per_investigator',
  'weakness',
  'action',
  'reaction',
  'free',
  'bullet',
  'guide_bullet',
  'curse',
  'bless',
  'frost',
  'seal_a',
  'seal_b',
  'seal_c',
  'seal_d',
  'seal_e',
  'day',
  'night',
  'codex',
  'tdc_rune_a',
  'tdc_rune_b',
  'tdc_rune_c',
  'tdc_rune_d',
  'tdc_rune_e',
  'tdc_rune_f',
  'tdc_rune_g',
  'tdc_rune_h',
  'tdc_rune_i',
  'tdc_rune_j',
  'tdc_rune_k',
  'tdc_rune_l',
  'tdc_rune_m',
  'tdc_rune_n',
  'tdc_rune_o',
  'tdc_rune_p',
  'tdc_rune_q',
  'tdc_rune_r',
  'tdc_rune_s',
  'tdc_rune_t',
  'tdc_rune_u',
  'tdc_rune_v',
  'tdc_rune_w',
  'tdc_rune_x',
  'tdc_rune_y',
  'tdc_rune_z',
]);

function CenterIconWrapper({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <MarkdownText>
      {'\n'}
      { Platform.OS === 'android' ? '\n' : '' }
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width - s * 6,
        maxWidth: MAX_WIDTH - s * 2,
      }}>
        { children }
      </View>
      { Platform.OS === 'android' ? '' : '\n'}
    </MarkdownText>
  );
}
export default function ArkhamIconNode(usePingFang: boolean, { colors, fontScale, width }: StyleContextType, sizeScale: number) {
  return (
    node: Node & WithIconName,
    output: OutputFunction,
    state: RenderState & State,
  ) => {
    const icon_name = BAD_ICON_NAMES[node.name] || node.name;
    if (icon_name.startsWith('encounter=')) {
      return (
        <CenterIconWrapper key={state.key} width={width}>
          <EncounterIcon
            key={state.key}
            encounter_code={icon_name.replace('encounter=', '')}
            size={36 * fontScale * sizeScale}
            color={colors.darkText}
          />
        </CenterIconWrapper>
      );
    }
    if (icon_name.startsWith('location=')) {
      return (
        <CenterIconWrapper key={state.key} width={width}>
          <LocationConnectorIcon
            connector={icon_name.replace('location=', '')}
            size={36 * fontScale * sizeScale}
          />
        </CenterIconWrapper>
      );
    }
    if (!ALL_ICONS.has(icon_name)) {
      return (
        <MarkdownText
          key={state.key}
          allowFontScaling
          style={{
            fontFamily: usePingFang ? 'PingFangTC' : 'Alegreya',
            fontWeight: '700',
            fontStyle: state.italic && !usePingFang ? 'italic' : 'normal',
            fontSize: 16 * fontScale * sizeScale,
            lineHeight: 20 * fontScale * sizeScale,
          }}
        >
          { icon_name }
        </MarkdownText>
      );
    }
    return (
      <ArkhamSlimIcon
        key={state.key}
        name={icon_name}
        size={16 * fontScale * sizeScale}
        color={colors.darkText}
      />
    );
  };
}