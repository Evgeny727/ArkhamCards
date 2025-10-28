import React, { useCallback, useContext, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { find } from 'lodash';
import Scrubber from 'react-native-scrubber'
import { c, t } from 'ttag';

import { StyleContext } from '@styles/StyleContext';

import space from '@styles/space';
import AppIcon from '@icons/AppIcon';
import { TouchableOpacity } from '@components/core/Touchables';
import { Narration } from '@data/scenario/types';
import { usePressCallback } from '@components/core/hooks';
import { useDispatch } from 'react-redux';
import { SET_PLAYBACK_RATE } from '@actions/types';
import { useAudioAccess, usePlayNarrationTrack } from '@lib/audio/narrationHelpers';
import { State, useAudioPlayerContext, useCurrentTrack, usePlaybackState, useProgress } from '@lib/audio/AudioPlayerContext';

export function useNarration(narration?: Narration): Narration | undefined {
  const [hasAudio, narrationLangs] = useAudioAccess();
  if (!hasAudio ||
    !narration ||
    !find(narration.lang, lang => narrationLangs.find(narrationLang => narrationLang === lang))
  ) {
    return undefined;
  }
  return narration;
}

interface IconProps {
  narration: Narration;
}

function padZero(x: number): string {
  return x < 10 ? `0${x}` : `${x}`;
}

function parseTime(time: number): string {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time - mins * 60);
  return `${padZero(mins)}:${padZero(secs)}`
}

function rateToString(rate: number): string {
  switch (rate) {
    case 1: return '1';
    case 1.25: return '1¼';
    case 1.5: return '1½';
    case 1.75: return '1¾';
    case 2: return '2';
    default: return '?';
  }
}

function nextRate(rate: number): number {
  if (rate + 0.25 <= 2) {
    return rate + 0.25;
  }
  return 1;
}

export function NarrationInlineControls({ narration }: IconProps) {
  const { colors, typography } = useContext(StyleContext);
  const dispatch = useDispatch();
  const currentTrack = useCurrentTrack();
  const playerState = usePlaybackState();
  const { jumpBack, playbackRate: rate, setRate, pause, play, seekTo } = useAudioPlayerContext();
  const { position, duration } = useProgress(1000);
  const posTime = parseTime(position);
  const durTime = parseTime(duration);
  const playNarrationTrack = usePlayNarrationTrack();


  const isCurrentTrack = currentTrack && currentTrack.narrationId === narration.id;
  // tslint:disable-next-line: strict-comparisons
  const isPlaying = playerState.state === State.Playing && isCurrentTrack;
  const onJumpBackPress = useCallback(async() => {
    jumpBack(10);
  }, [jumpBack]);
  const onRatePress = useCallback(() => {
    const newRate = nextRate(rate);
    setRate(newRate);
    dispatch({
      type: SET_PLAYBACK_RATE,
      rate: newRate,
    });
  }, [dispatch, rate, setRate]);
  const [seekPos, setSeekPos] = useState<number>();
  const onScrub = useCallback(async(pos: number) => {
    try {
      setSeekPos(pos);
      seekTo(pos);
      setSeekPos(undefined);
    } catch (e) {
      console.log(e);
    }
  }, [seekTo]);
  const onPressNarration = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isCurrentTrack && playerState.state === State.Paused) {
      play();
    } else {
      playNarrationTrack(narration.id);
    }
  }, [narration, isPlaying, isCurrentTrack, playerState, playNarrationTrack, pause, play]);
  const onPlayPausePress = usePressCallback(onPressNarration);
  return (
    <View style={[space.marginSideM, space.marginTopS]}>
      <View style={styles.narrationControls}>
        <View style={styles.leftControls}>
          <TouchableOpacity hitSlop={4} onPress={onPlayPausePress} accessibilityLabel={isPlaying ? c('narration').t`Pause` : c('narration').t`Play`}>
            <View style={[
              styles.button,
              { backgroundColor: colors.L20 },
            ]}>
              <AppIcon
                name={isPlaying ? 'pause' : 'play'}
                size={Platform.OS === 'android' ? 36 : 40}
                color={colors.M}
              />
            </View>
          </TouchableOpacity>
          { isCurrentTrack ? (
            <>
              <View style={space.marginLeftXs}>
                <TouchableOpacity hitSlop={4} onPress={onJumpBackPress} accessibilityLabel={c('narration').t`Jump back`}>
                  <View style={[styles.button, { backgroundColor: colors.L20 }]}>
                    <AppIcon
                      name="repeat"
                      size={Platform.OS === 'android' ? 32 : 40}
                      color={colors.M}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              { isCurrentTrack && (
                <View style={space.marginLeftXs}>
                  <TouchableOpacity hitSlop={4} onPress={onRatePress} accessibilityLabel={c('narration').t`Audio speed: ${rate}`}>
                    <View style={[styles.button, { backgroundColor: colors.L20 }]}>
                      <Text style={[typography.button, { color: colors.M, textAlignVertical: 'center' }]}>{rateToString(rate)}x</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              { isPlaying && (
                <View style={space.marginLeftXs}>
                  <AppIcon name="voiceover" size={40} color={colors.M} accessibilityLabel={c('narration').t`Playing audio`} />
                </View>
              )}

            </>
          ) : (
            <Text style={[space.marginLeftS, typography.small, { color: colors.D20 }]}>{t`Narrate`}</Text>
          )}
        </View>
        <View style={styles.rightControls}>
          { (isCurrentTrack && duration > 0) && (
            <Text style={[typography.small, { color: colors.D20, textAlign: 'right', fontVariant: ['tabular-nums'] }]}>{posTime} · {durTime}</Text>
          ) }
        </View>
      </View>
      <View
        style={space.paddingTopS}
      >
        { isCurrentTrack ? (
          <Scrubber
            onSlidingComplete={onScrub}
            displayValues={false}
            value={seekPos !== undefined ? seekPos : position}
            totalDuration={duration}
            // bufferedValue={buffered}
            // bufferedTrackColor={colors.L10}
            trackBackgroundColor={colors.L20}
            trackColor={colors.D20}
            scrubbedColor={colors.D20}
          />
        ) : (
          <View style={{
            height: 3,
            borderRadius: 1,
            width: '100%',
            flexDirection: 'row',
            backgroundColor: colors.L10,
          }} />
        ) }
      </View>
    </View>
  );
}

interface TitleProps {
  narration: Narration;
  hideTitle: boolean;
}

function NarrationLine({ narration, hideTitle }: TitleProps) {
  const { colors, typography } = useContext(StyleContext);
  return (
    <View>
      { !hideTitle && (
        <View
          style={[space.marginSideM, space.marginTopM, styles.rowCenter]}
        >
          <Text style={[typography.header, typography.center, { color: colors.D20 }, space.paddingLeftS]}>
            { narration.name }
          </Text>
        </View>
      ) }
      <NarrationInlineControls narration={narration} />
    </View>
  );
}

interface ComponentProps {
  narration?: Narration;
  hideTitle: boolean;
  children: React.ReactNode | React.ReactNode[];
}

export default function NarrationStepComponent(props: ComponentProps) {
  const { children, hideTitle } = props;
  const narration = useNarration(props.narration);
  return (
    <>
      { narration && <NarrationLine narration={narration} hideTitle={hideTitle} /> }
      { children }
    </>
  );
}

const styles = StyleSheet.create({
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  narrationControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
});
