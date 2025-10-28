import { flatMap, map, forEach, omit } from 'lodash';

import { LegacyCampaign, Campaign, DeckId, Deck, getDeckId, CampaignGuideState, GuideInput, DecksMap, LegacyDeck, LegacyCampaignGuideState } from '@actions/types';
import { generateUuid } from '@lib/uuid';

export function migrateDecks(
  decks: LegacyDeck[]
): [DecksMap, { [key: string]: DeckId | undefined}] {
  const all: DecksMap = {};
  const deckMap: { [key: string]: DeckId | undefined} = {};

  forEach(decks, deck => {
    if (!deck || !deck.slots) {
      return;
    }
    const updatedDeck: Deck = ((deck.id < 0 || deck.local)) ? {
      ...omit(deck, ['id', 'uuid']),
      local: true,
      uuid: deck.uuid || generateUuid(),
    } : {
      ...omit(deck, ['local', 'uuid']),
      local: undefined,
      uuid: undefined,
      user_id: -1,
    };
    const deckId = getDeckId(updatedDeck);
    all[deckId.uuid] = updatedDeck;
    deckMap[deck.id] = deckId;
  });
  forEach(all, (deck: any) => {
    if (deck.previous_deck) {
      deck.previousDeckId = deckMap[deck.previous_deck] || undefined;
      delete deck.previous_deck;
    }
    if (deck.next_deck) {
      deck.nextDeckId = deckMap[deck.next_deck] || undefined;
      delete deck.next_deck;
    }
  });
  return [all, deckMap];
}

function migrateCampaignDeckIds(
  campaign: LegacyCampaign,
  deckMap: { [numberId: number]: DeckId | undefined },
  allDecks: { [uuid: string]: Deck }
): DeckId[] {
  if (campaign.deckIds) {
    // Already migrated, nothing needed.
    return campaign.deckIds;
  }
  if (campaign.baseDeckIds) {
    return flatMap(campaign.baseDeckIds, id => deckMap[id] || []);
  }
  if (campaign.latestDeckIds) {
    // Very old campaign
    return flatMap(campaign.latestDeckIds, oldDeckId => {
      const deckId = deckMap[oldDeckId];
      if (!deckId) {
        return [];
      }
      let deck = allDecks[deckId.uuid];
      while (deck && deck.previousDeckId && deck.previousDeckId.uuid in allDecks) {
        deck = allDecks[deck.previousDeckId.uuid];
      }
      return deck ? getDeckId(deck) : [];
    });
  }
  // This is weird... I guess we have nothing?
  return [];
}

export function migrateCampaigns(
  legacyCampaigns: LegacyCampaign[],
  deckMap: { [numberId: number]: DeckId | undefined },
  allDecks: { [uuid: string]: Deck }
): [{
    [campaignUuid: string]: Campaign
  }, {
    [campaignId: string]: string;
  }] {

  const all: { [uuid: string]: Campaign } = {};
  const campaignUuids: { [id: string]: string} = {};
  forEach(legacyCampaigns, (campaign: LegacyCampaign) => {
    campaignUuids[campaign.id] = campaign.uuid || generateUuid();
  });
  forEach(legacyCampaigns, (campaign: LegacyCampaign) => {
    if (!campaign) {
      return;
    }
    const deckIds = migrateCampaignDeckIds(campaign, deckMap, allDecks);
    const campaignUuid = campaignUuids[campaign.id];
    const newCampaign: Campaign = {
      ...omit(campaign, ['baseDeckIds', 'latestDeckIds', 'uuid', 'id', 'linkedCampaignId', 'link']),
      deckIds,
      uuid: campaignUuid,
    };
    if (campaign.linkedCampaignId) {
      newCampaign.linkedCampaignUuid = campaignUuids[campaign.linkedCampaignId];
    }
    if (campaign.link) {
      newCampaign.linkUuid = {
        campaignIdA: campaignUuids[campaign.link.campaignIdA],
        campaignIdB: campaignUuids[campaign.link.campaignIdB],
      };
    }
    all[campaignUuid] = newCampaign;
  });
  return [all, campaignUuids];
}

export function migrateGuides(
  guides: { [id: string]: LegacyCampaignGuideState | undefined },
  campaignMapping: { [id: string]: string },
  deckMap: { [numberId: number]: DeckId | undefined },
): { [id: string]: CampaignGuideState } {
  const all: { [uuid: string]: CampaignGuideState } = {};
  forEach(guides, (guide, id) => {
    if (guide && campaignMapping[id]) {
      const inputs: GuideInput[] = map(guide.inputs || [], input => {
        if (input.type === 'choice_list' && input.choices.deckId && input.choices.deckId.length) {
          const deckId = deckMap[input.choices.deckId[0]];
          if (!deckId) {
            return input;
          }
          return {
            ...input,
            deckId,
          };
        }
        return input;
      });
      const campaignId = campaignMapping[id];
      all[campaignId] = {
        ...guide,
        uuid: guide.uuid || campaignId,
        inputs,
      };
    }
  });
  return all;
}