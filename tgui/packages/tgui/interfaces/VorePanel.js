import { capitalize } from 'common/string';
import { Fragment } from 'inferno';
import { useBackend, useLocalState } from '../backend';
import { Box, Button, Flex, Collapsible, Icon, LabeledList, NoticeBox, Section, Tabs, Divider } from '../components';
import { Window } from '../layouts';
import { classes } from 'common/react';

const stats = [null, 'average', 'bad'];

const digestModeToColor = {
  Hold: null,
  Digest: 'red',
  Absorb: 'purple',
  Unabsorb: 'purple',
  Drain: 'orange',
  Selective: 'orange',
  Shrink: 'teal',
  Grow: 'teal',
  'Size Steal': 'teal',
  Heal: 'green',
  'Encase In Egg': 'blue',
};

const digestModeToPreyMode = {
  Hold: 'being held.',
  Digest: 'being digested.',
  Absorb: 'being absorbed.',
  Unabsorb: 'being unabsorbed.',
  Drain: 'being drained.',
  Selective: 'being processed.',
  Shrink: 'being shrunken.',
  Grow: 'being grown.',
  'Size Steal': 'having your size stolen.',
  Heal: 'being healed.',
  'Encase In Egg': 'being encased in an egg.',
};

/**
 * There are three main sections to this UI.
 *  - The Inside Panel, where all relevant data for interacting with a belly you're in is located.
 *  - The Belly Selection Panel, where you can select what belly people will go into and customize the active one.
 *  - User Preferences, where you can adjust all of your vore preferences on the fly.
 */
export const VorePanel = (props, context) => {
  const { act, data } = useBackend(context);

  const [tabIndex, setTabIndex] = useLocalState(context, 'panelTabIndex', 0);

  const tabs = [];

  tabs[0] = <VoreBellySelectionAndCustomization />;

  tabs[1] = <VoreUserPreferences />;

  return (
    <Window width={890} height={660} theme="abstract" resizable>
      <Window.Content scrollable>
        {(data.unsaved_changes && (
          <NoticeBox danger>
            <Flex>
              <Flex.Item basis="90%">Warning: Unsaved Changes!</Flex.Item>
              <Flex.Item>
                <Button
                  content="Save Prefs"
                  icon="save"
                  onClick={() => act('saveprefs')}
                />
              </Flex.Item>
              <Flex.Item>
                <Button
                  content="Save Prefs & Export Selected Belly"
                  icon="download"
                  onClick={() => {
                    act('saveprefs');
                    act('exportpanel');
                  }}
                />
              </Flex.Item>
            </Flex>
          </NoticeBox>
        )) ||
          null}
        <VoreInsidePanel />
        <Tabs>
          <Tabs.Tab selected={tabIndex === 0} onClick={() => setTabIndex(0)}>
            Bellies
            <Icon name="list" ml={0.5} />
          </Tabs.Tab>
          <Tabs.Tab selected={tabIndex === 1} onClick={() => setTabIndex(1)}>
            Preferences
            <Icon name="user-cog" ml={0.5} />
          </Tabs.Tab>
        </Tabs>
        {tabs[tabIndex] || 'Error'}
      </Window.Content>
    </Window>
  );
};

const VoreInsidePanel = (props, context) => {
  const { act, data } = useBackend(context);

  const { absorbed, belly_name, belly_mode, desc, pred, contents, ref } =
    data.inside;

  if (!belly_name) {
    return <Section title="Inside">You aren&apos;t inside anyone.</Section>;
  }

  return (
    <Section title="Inside">
      <Box color="green" inline>
        You are currently {absorbed ? 'absorbed into' : 'inside'}
      </Box>
      &nbsp;
      <Box color="yellow" inline>
        {pred}&apos;s
      </Box>
      &nbsp;
      <Box color="red" inline>
        {belly_name}
      </Box>
      &nbsp;
      <Box color="yellow" inline>
        and you are
      </Box>
      &nbsp;
      <Box color={digestModeToColor[belly_mode]} inline>
        {digestModeToPreyMode[belly_mode]}
      </Box>
      &nbsp;
      <Box color="label">{desc}</Box>
      {(contents.length && (
        <Collapsible title="Belly Contents">
          <VoreContentsPanel contents={contents} belly={ref} />
        </Collapsible>
      )) ||
        'There is nothing else around you.'}
    </Section>
  );
};

const VoreBellySelectionAndCustomization = (props, context) => {
  const { act, data } = useBackend(context);

  const { our_bellies, selected } = data;

  return (
    <Flex>
      <Flex.Item shrink>
        <Section title="My Bellies" scollable>
          <Tabs vertical>
            <Tabs.Tab onClick={() => act('newbelly')}>
              New
              <Icon name="plus" ml={0.5} />
            </Tabs.Tab>
            <Tabs.Tab onClick={() => act('exportpanel')}>
              Export
              <Icon name="file-export" ml={0.5} />
            </Tabs.Tab>
            <Tabs.Tab onClick={() => act('importpanel')}>
              Import
              <Icon name="file-import" ml={0.5} />
            </Tabs.Tab>
            <Divider />
            {our_bellies.map((belly) => (
              <Tabs.Tab
                key={belly.name}
                selected={belly.selected}
                textColor={digestModeToColor[belly.digest_mode]}
                onClick={() => act('bellypick', { bellypick: belly.ref })}>
                <Box
                  inline
                  textColor={
                    (belly.selected && digestModeToColor[belly.digest_mode]) ||
                    null
                  }>
                  {belly.name} ({belly.contents})
                </Box>
              </Tabs.Tab>
            ))}
          </Tabs>
        </Section>
      </Flex.Item>
      <Flex.Item grow>
        {selected && (
          <Section title={selected.belly_name}>
            <VoreSelectedBelly belly={selected} />
          </Section>
        )}
      </Flex.Item>
    </Flex>
  );
};

/**
 * Subtemplate of VoreBellySelectionAndCustomization
 */
const VoreSelectedBelly = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const { contents } = belly;

  const [tabIndex, setTabIndex] = useLocalState(context, 'bellyTabIndex', 0);

  const tabs = [];

  tabs[0] = <VoreSelectedBellyControls belly={belly} />;

  tabs[1] = <VoreSelectedBellyDescriptions belly={belly} />;

  tabs[2] = <VoreSelectedBellyOptions belly={belly} />;

  tabs[3] = <VoreSelectedBellySounds belly={belly} />;

  tabs[4] = <VoreSelectedBellyVisuals belly={belly} />;

  tabs[5] = <VoreSelectedBellyInteractions belly={belly} />;

  tabs[6] = <VoreSelectedBellyLiquidOptions belly={belly} />;

  tabs[7] = <VoreSelectedBellyLiquidMessages belly={belly} />;

  tabs[8] = <VoreContentsPanel outside contents={contents} />;

  return (
    <Fragment>
      <Tabs>
        <Tabs.Tab selected={tabIndex === 0} onClick={() => setTabIndex(0)}>
          Controls
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 1} onClick={() => setTabIndex(1)}>
          Descriptions
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 2} onClick={() => setTabIndex(2)}>
          Options
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 3} onClick={() => setTabIndex(3)}>
          Sounds
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 4} onClick={() => setTabIndex(4)}>
          Visuals
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 5} onClick={() => setTabIndex(5)}>
          Interactions
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 6} onClick={() => setTabIndex(6)}>
          Liquid Options
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 7} onClick={() => setTabIndex(7)}>
          Liquid Messages
        </Tabs.Tab>
        <Tabs.Tab selected={tabIndex === 8} onClick={() => setTabIndex(8)}>
          Contents ({contents.length})
        </Tabs.Tab>
      </Tabs>
      {tabs[tabIndex] || 'Error'}
    </Fragment>
  );
};

const VoreSelectedBellyControls = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const { belly_name, mode, item_mode, addons } = belly;

  return (
    <LabeledList>
      <LabeledList.Item
        label="Name"
        buttons={
          <Fragment>
            <Button
              icon="arrow-up"
              tooltipPosition="left"
              tooltip="Move this belly tab up."
              onClick={() => act('move_belly', { dir: -1 })}
            />
            <Button
              icon="arrow-down"
              tooltipPosition="left"
              tooltip="Move this belly tab down."
              onClick={() => act('move_belly', { dir: 1 })}
            />
          </Fragment>
        }>
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_name' })}
          content={belly_name}
        />
      </LabeledList.Item>
      <LabeledList.Item label="Mode">
        <Button
          color={digestModeToColor[mode]}
          onClick={() => act('set_attribute', { attribute: 'b_mode' })}
          content={mode}
        />
      </LabeledList.Item>
      <LabeledList.Item label="Mode Addons">
        {(addons.length && addons.join(', ')) || 'None'}
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_addons' })}
          ml={1}
          icon="plus"
        />
      </LabeledList.Item>
      <LabeledList.Item label="Item Mode">
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_item_mode' })}
          content={item_mode}
        />
      </LabeledList.Item>
      <LabeledList.Item basis="100%" mt={1}>
        <Button.Confirm
          fluid
          icon="exclamation-triangle"
          confirmIcon="trash"
          color="red"
          content="Delete Belly"
          confirmContent="This is irreversable!"
          onClick={() => act('set_attribute', { attribute: 'b_del' })}
        />
      </LabeledList.Item>
    </LabeledList>
  );
};

const VoreSelectedBellyDescriptions = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const { verb, release_verb, desc, absorbed_desc } = belly;

  return (
    <LabeledList>
      <LabeledList.Item
        label="Description"
        buttons={
          <Button
            onClick={() => act('set_attribute', { attribute: 'b_desc' })}
            icon="pen"
          />
        }>
        {desc}
      </LabeledList.Item>
      <LabeledList.Item
        label="Description (Absorbed)"
        buttons={
          <Button
            onClick={() =>
              act('set_attribute', { attribute: 'b_absorbed_desc' })
            }
            icon="pen"
          />
        }>
        {absorbed_desc}
      </LabeledList.Item>
      <LabeledList.Item label="Vore Verb">
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_verb' })}
          content={verb}
        />
      </LabeledList.Item>
      <LabeledList.Item label="Release Verb">
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_release_verb' })}
          content={release_verb}
        />
      </LabeledList.Item>
      <LabeledList.Item label="Examine Messages">
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'em' })
          }
          content="Examine Message (when full)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'ema' })
          }
          content="Examine Message (with absorbed victims)"
        />
      </LabeledList.Item>
      <LabeledList.Item label="Struggle Messages">
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'smo' })
          }
          content="Struggle Message (outside)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'smi' })
          }
          content="Struggle Message (inside)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'asmo' })
          }
          content="Absorbed Struggle Message (outside)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'asmi' })
          }
          content="Absorbed Struggle Message (inside)"
        />
      </LabeledList.Item>
      <LabeledList.Item label="Bellymode Messages">
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'dmp' })
          }
          content="Digest Message (to prey)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'dmo' })
          }
          content="Digest Message (to you)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'amp' })
          }
          content="Absorb Message (to prey)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'amo' })
          }
          content="Absorb Message (to you)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'uamp' })
          }
          content="Unabsorb Message (to prey)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'uamo' })
          }
          content="Unabsorb Message (to you)"
        />
      </LabeledList.Item>
      <LabeledList.Item label="Idle Messages">
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_hold' })
          }
          content="Idle Messages (Hold)"
        />
        <Button
          onClick={() =>
            act('set_attribute', {
              attribute: 'b_msgs',
              msgtype: 'im_holdabsorbed',
            })
          }
          content="Idle Messages (Hold Absorbed)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_digest' })
          }
          content="Idle Messages (Digest)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_absorb' })
          }
          content="Idle Messages (Absorb)"
        />
        <Button
          onClick={() =>
            act('set_attribute', {
              attribute: 'b_msgs',
              msgtype: 'im_unabsorb',
            })
          }
          content="Idle Messages (Unabsorb)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_drain' })
          }
          content="Idle Messages (Drain)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_heal' })
          }
          content="Idle Messages (Heal)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_steal' })
          }
          content="Idle Messages (Size Steal)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_shrink' })
          }
          content="Idle Messages (Shrink)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_grow' })
          }
          content="Idle Messages (Grow)"
        />
        <Button
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'im_egg' })
          }
          content="Idle Messages (Encase In Egg)"
        />
      </LabeledList.Item>
      <LabeledList.Item label="Reset Messages">
        <Button
          color="red"
          onClick={() =>
            act('set_attribute', { attribute: 'b_msgs', msgtype: 'reset' })
          }
          content="Reset Messages"
        />
      </LabeledList.Item>
    </LabeledList>
  );
};

const VoreSelectedBellyOptions = (props, context) => {
  const { act, data } = useBackend(context);

  const { host_mobtype } = data;
  const { is_cyborg, is_vore_simple_mob } = host_mobtype;
  const { belly } = props;
  const {
    can_taste,
    nutrition_percent,
    digest_brute,
    digest_burn,
    digest_oxy,
    digest_tox,
    digest_clone,
    bulge_size,
    display_absorbed_examine,
    shrink_grow_size,
    emote_time,
    emote_active,
    contaminates,
    contaminate_flavor,
    contaminate_color,
    egg_type,
    selective_preference,
    save_digest_mode,
    eating_privacy_local,
    silicon_belly_overlay_preference,
    visible_belly_minimum_prey,
    overlay_min_prey_size,
    override_min_prey_size,
    override_min_prey_num,
    drainmode, // RS Edit || ports VOREStation PR 15876
  } = belly;

  return (
    <Flex wrap="wrap">
      <Flex.Item basis="49%" grow={1}>
        <LabeledList>
          <LabeledList.Item label="Can Taste">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_tastes' })}
              icon={can_taste ? 'toggle-on' : 'toggle-off'}
              selected={can_taste}
              content={can_taste ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Contaminates">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_contaminate' })
              }
              icon={contaminates ? 'toggle-on' : 'toggle-off'}
              selected={contaminates}
              content={contaminates ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          {(contaminates && (
            <Fragment>
              <LabeledList.Item label="Contamination Flavor">
                <Button
                  onClick={() =>
                    act('set_attribute', {
                      attribute: 'b_contamination_flavor',
                    })
                  }
                  icon="pen"
                  content={contaminate_flavor}
                />
              </LabeledList.Item>
              <LabeledList.Item label="Contamination Color">
                <Button
                  onClick={() =>
                    act('set_attribute', { attribute: 'b_contamination_color' })
                  }
                  icon="pen"
                  content={capitalize(contaminate_color)}
                />
              </LabeledList.Item>
            </Fragment>
          )) ||
            null}
          <LabeledList.Item label="Nutritional Gain">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_nutritionpercent' })
              }
              content={nutrition_percent + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Required Examine Size">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_bulge_size' })
              }
              content={bulge_size * 100 + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Display Absorbed Examines">
            <Button
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_display_absorbed_examine',
                })
              }
              icon={display_absorbed_examine ? 'toggle-on' : 'toggle-off'}
              selected={display_absorbed_examine}
              content={display_absorbed_examine ? 'True' : 'False'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Toggle Vore Privacy">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_eating_privacy' })
              }
              content={capitalize(eating_privacy_local)}
            />
          </LabeledList.Item>

          <LabeledList.Item label="Save Digest Mode">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_save_digest_mode' })
              }
              icon={save_digest_mode ? 'toggle-on' : 'toggle-off'}
              selected={save_digest_mode}
              content={save_digest_mode ? 'True' : 'False'}
            />
          </LabeledList.Item>
        </LabeledList>
        <VoreSelectedMobTypeBellyButtons belly={belly} />
      </Flex.Item>
      <Flex.Item basis="49%" grow={1}>
        <LabeledList>
          <LabeledList.Item label="Idle Emotes">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_emoteactive' })
              }
              icon={emote_active ? 'toggle-on' : 'toggle-off'}
              selected={emote_active}
              content={emote_active ? 'Active' : 'Inactive'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Idle Emote Delay">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_emotetime' })}
              content={emote_time + ' seconds'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Brute Damage">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_brute_dmg' })}
              content={digest_brute}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Burn Damage">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_burn_dmg' })}
              content={digest_burn}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Suffocation Damage">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_oxy_dmg' })}
              content={digest_oxy}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Toxins Damage">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_tox_dmg' })}
              content={digest_tox}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Clone Damage">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_clone_dmg' })}
              content={digest_clone}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Drain Finishing Mode">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_drainmode' })} // RS Edit || Ports VOREStation PR 15876
              content={drainmode}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Shrink/Grow Size">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_grow_shrink' })
              }
              content={shrink_grow_size * 100 + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Egg Type">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_egg_type' })}
              icon="pen"
              content={capitalize(egg_type)}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Selective Mode Preference">
            <Button
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_selective_mode_pref_toggle',
                })
              }
              content={capitalize(selective_preference)}
            />
          </LabeledList.Item>
        </LabeledList>
      </Flex.Item>
    </Flex>
  );
};

const VoreSelectedMobTypeBellyButtons = (props, context) => {
  const { act, data } = useBackend(context);
  const { host_mobtype } = data;
  const { is_cyborg, is_vore_simple_mob } = host_mobtype;
  const { belly } = props;
  const {
    silicon_belly_overlay_preference,
    visible_belly_minimum_prey,
    overlay_min_prey_size,
    override_min_prey_size,
    override_min_prey_num,
  } = belly;

  if (is_cyborg) {
    return (
      <Section title={'Cyborg Controls'} width={'80%'}>
        <LabeledList>
          <LabeledList.Item label="Toggle Belly Overlay Mode">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_silicon_belly' })
              }
              content={capitalize(silicon_belly_overlay_preference)}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Minimum Prey num for VoreBelly">
            <Button
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_min_belly_number_flat',
                })
              }
              content={visible_belly_minimum_prey}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Minimum Prey Size for Vorebelly">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_min_belly_prey_size' })
              }
              content={overlay_min_prey_size * 100 + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Toggle Number Override">
            <Button
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_override_min_belly_prey_size',
                })
              }
              icon={override_min_prey_size ? 'toggle-on' : 'toggle-off'}
              selected={override_min_prey_size}
              content={override_min_prey_size ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Minimum Prey Number Override">
            <Button
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_min_belly_number_override',
                })
              }
              content={override_min_prey_num}
            />
          </LabeledList.Item>
        </LabeledList>
      </Section>
    );
  } else if (is_vore_simple_mob) {
    return (
      // For now, we're only returning empty. TODO: Simple mob belly controls
      <LabeledList>
        <LabeledList.Item />
      </LabeledList>
    );
  } else {
    return (
      // Returning Empty element
      <LabeledList>
        <LabeledList.Item />
      </LabeledList>
    );
  }
};

const VoreSelectedBellySounds = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const { is_wet, wet_loop, fancy, sound, release_sound } = belly;

  return (
    <Flex wrap="wrap">
      <Flex.Item basis="49%" grow={1}>
        <LabeledList>
          <LabeledList.Item label="Fleshy Belly">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_wetness' })}
              icon={is_wet ? 'toggle-on' : 'toggle-off'}
              selected={is_wet}
              content={is_wet ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Internal Loop">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_wetloop' })}
              icon={wet_loop ? 'toggle-on' : 'toggle-off'}
              selected={wet_loop}
              content={wet_loop ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Use Fancy Sounds">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_fancy_sound' })
              }
              icon={fancy ? 'toggle-on' : 'toggle-off'}
              selected={fancy}
              content={fancy ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Vore Sound">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_sound' })}
              content={sound}
            />
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_soundtest' })}
              icon="volume-up"
            />
          </LabeledList.Item>
          <LabeledList.Item label="Release Sound">
            <Button
              onClick={() => act('set_attribute', { attribute: 'b_release' })}
              content={release_sound}
            />
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_releasesoundtest' })
              }
              icon="volume-up"
            />
          </LabeledList.Item>
        </LabeledList>
      </Flex.Item>
    </Flex>
  );
};

const VoreSelectedBellyVisuals = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const {
    belly_fullscreen,
    possible_fullscreens,
    disable_hud,
    belly_fullscreen_color,
    belly_fullscreen_color_secondary,
    belly_fullscreen_color_trinary,
    mapRef,
    colorization_enabled,
    vore_sprite_flags,
    affects_voresprite,
    absorbed_voresprite,
    absorbed_multiplier,
    liquid_voresprite,
    liquid_multiplier,
    item_voresprite,
    item_multiplier,
    health_voresprite,
    resist_animation,
    voresprite_size_factor,
    belly_sprite_option_shown,
    belly_sprite_to_affect,
    undergarment_chosen,
    undergarment_if_none,
    undergarment_color,
    tail_option_shown,
    tail_to_change_to,
    tail_colouration,
    tail_extra_overlay,
    tail_extra_overlay2,
  } = belly;

  return (
    <Fragment>
      <Section title="Vore Sprites">
        <Flex direction="row">
          <LabeledList>
            <LabeledList.Item label="Affect Vore Sprites">
              <Button
                onClick={() =>
                  act('set_attribute', { attribute: 'b_affects_vore_sprites' })
                }
                icon={affects_voresprite ? 'toggle-on' : 'toggle-off'}
                selected={affects_voresprite}
                content={affects_voresprite ? 'Yes' : 'No'}
              />
            </LabeledList.Item>
            {affects_voresprite ? (
              <span>
                {belly_sprite_option_shown ? (
                  <LabeledList.Item label="Belly Sprite to affect">
                    <Button
                      onClick={() =>
                        act('set_attribute', {
                          attribute: 'b_belly_sprite_to_affect',
                        })
                      }
                      content={belly_sprite_to_affect}
                    />
                  </LabeledList.Item>
                ) : (
                  ''
                )}
                <LabeledList.Item label="Count Absorbed prey for vore sprites">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_count_absorbed_prey_for_sprites',
                      })
                    }
                    icon={absorbed_voresprite ? 'toggle-on' : 'toggle-off'}
                    selected={absorbed_voresprite}
                    content={absorbed_voresprite ? 'Yes' : 'No'}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Absorbed Multiplier">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_absorbed_multiplier',
                      })
                    }
                    content={absorbed_multiplier}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Count liquid reagents for vore sprites">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_count_liquid_for_sprites',
                      })
                    }
                    icon={liquid_voresprite ? 'toggle-on' : 'toggle-off'}
                    selected={liquid_voresprite}
                    content={liquid_voresprite ? 'Yes' : 'No'}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Liquid Multiplier">
                  <Button
                    onClick={() =>
                      act('set_attribute', { attribute: 'b_liquid_multiplier' })
                    }
                    content={liquid_multiplier}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Count items for vore sprites">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_count_items_for_sprites',
                      })
                    }
                    icon={item_voresprite ? 'toggle-on' : 'toggle-off'}
                    selected={item_voresprite}
                    content={item_voresprite ? 'Yes' : 'No'}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Items Multiplier">
                  <Button
                    onClick={() =>
                      act('set_attribute', { attribute: 'b_item_multiplier' })
                    }
                    content={item_multiplier}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Prey health affects vore sprites">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_health_impacts_size',
                      })
                    }
                    icon={health_voresprite ? 'toggle-on' : 'toggle-off'}
                    selected={health_voresprite}
                    content={health_voresprite ? 'Yes' : 'No'}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Animation when prey resist">
                  <Button
                    onClick={() =>
                      act('set_attribute', { attribute: 'b_resist_animation' })
                    }
                    icon={resist_animation ? 'toggle-on' : 'toggle-off'}
                    selected={resist_animation}
                    content={resist_animation ? 'Yes' : 'No'}
                  />
                </LabeledList.Item>
                <LabeledList.Item label="Vore Sprite Size Factor">
                  <Button
                    onClick={() =>
                      act('set_attribute', {
                        attribute: 'b_size_factor_sprites',
                      })
                    }
                    content={voresprite_size_factor}
                  />
                </LabeledList.Item>
                {tail_option_shown &&
                vore_sprite_flags.includes('Undergarment addition') ? (
                  <div>
                    <LabeledList.Item label="Undergarment type to affect">
                      <Button
                        onClick={() =>
                          act('set_attribute', {
                            attribute: 'b_undergarment_choice',
                          })
                        }
                        content={undergarment_chosen}
                      />
                    </LabeledList.Item>
                    <LabeledList.Item label="Undergarment if none equipped">
                      <Button
                        onClick={() =>
                          act('set_attribute', {
                            attribute: 'b_undergarment_if_none',
                          })
                        }
                        content={undergarment_if_none}
                      />
                    </LabeledList.Item>
                  </div>
                ) : (
                  ''
                )}
                {tail_option_shown &&
                vore_sprite_flags.includes('Tail adjustment') ? (
                  <LabeledList.Item label="Tail to change to">
                    <Button
                      onClick={() =>
                        act('set_attribute', {
                          attribute: 'b_tail_to_change_to',
                        })
                      }
                      content={tail_to_change_to}
                    />
                  </LabeledList.Item>
                ) : (
                  ''
                )}
              </span>
            ) : (
              ''
            )}
          </LabeledList>
        </Flex>
      </Section>
      <Section title="Belly Fullscreens Preview and Coloring">
        <Flex direction="row">
          <Box
            backgroundColor={belly_fullscreen_color}
            width="20px"
            height="20px"
          />
          <Button
            icon="eye-dropper"
            onClick={() =>
              act('set_attribute', {
                attribute: 'b_fullscreen_color',
                val: null,
              })
            }>
            Select Primary Color
          </Button>
          <Box
            backgroundColor={belly_fullscreen_color_secondary}
            width="20px"
            height="20px"
          />
          <Button
            icon="eye-dropper"
            onClick={() =>
              act('set_attribute', {
                attribute: 'b_fullscreen_color_secondary',
                val: null,
              })
            }>
            Select Secondary Color
          </Button>
          <Box
            backgroundColor={belly_fullscreen_color_trinary}
            width="20px"
            height="20px"
          />
          <Button
            icon="eye-dropper"
            onClick={() =>
              act('set_attribute', {
                attribute: 'b_fullscreen_color_trinary',
                val: null,
              })
            }>
            Select Trinary Color
          </Button>
          <LabeledList.Item label="Enable Coloration">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_colorization_enabled' })
              }
              icon={colorization_enabled ? 'toggle-on' : 'toggle-off'}
              selected={colorization_enabled}
              content={colorization_enabled ? 'Yes' : 'No'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Preview Belly">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_preview_belly' })
              }
              content={'Preview'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Clear Preview">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_clear_preview' })
              }
              content={'Clear'}
            />
          </LabeledList.Item>
        </Flex>
      </Section>
      <Section>
        <Section title="Vore FX">
          <LabeledList>
            <LabeledList.Item label="Disable Prey HUD">
              <Button
                onClick={() =>
                  act('set_attribute', { attribute: 'b_disable_hud' })
                }
                icon={disable_hud ? 'toggle-on' : 'toggle-off'}
                selected={disable_hud}
                content={disable_hud ? 'Yes' : 'No'}
              />
            </LabeledList.Item>
          </LabeledList>
        </Section>
        <Section title="Belly Fullscreens Styles" width="800px">
          Belly styles:
          <Button
            fluid
            selected={belly_fullscreen === '' || belly_fullscreen === null}
            onClick={() =>
              act('set_attribute', { attribute: 'b_fullscreen', val: null })
            }>
            Disabled
          </Button>
          {Object.keys(possible_fullscreens).map((key) => (
            <span style={{ width: '256px' }}>
              <Button
                key={key}
                width="256px"
                height="256px"
                selected={key === belly_fullscreen}
                onClick={() =>
                  act('set_attribute', { attribute: 'b_fullscreen', val: key })
                }>
                <Box
                  className={classes(['vore240x240', key])}
                  style={{
                    transform: 'translate(0%, 4%)',
                  }}
                />
              </Button>
            </span>
          ))}
        </Section>
      </Section>
    </Fragment>
  );
};

const VoreSelectedBellyInteractions = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const { escapable, interacts, autotransfer_enabled, autotransfer } = belly;

  return (
    <Section
      title="Belly Interactions"
      buttons={
        <Button
          onClick={() => act('set_attribute', { attribute: 'b_escapable' })}
          icon={escapable ? 'toggle-on' : 'toggle-off'}
          selected={escapable}
          content={escapable ? 'Interactions On' : 'Interactions Off'}
        />
      }>
      {escapable ? (
        <LabeledList>
          <LabeledList.Item label="Escape Chance">
            <Button
              content={interacts.escapechance + '%'}
              onClick={() =>
                act('set_attribute', { attribute: 'b_escapechance' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Item label="Escape Time">
            <Button
              content={interacts.escapetime / 10 + 's'}
              onClick={() =>
                act('set_attribute', { attribute: 'b_escapetime' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Divider />
          <LabeledList.Item label="Transfer Chance">
            <Button
              content={interacts.transferchance + '%'}
              onClick={() =>
                act('set_attribute', { attribute: 'b_transferchance' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Item label="Transfer Location">
            <Button
              content={
                interacts.transferlocation
                  ? interacts.transferlocation
                  : 'Disabled'
              }
              onClick={() =>
                act('set_attribute', { attribute: 'b_transferlocation' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Divider />
          <LabeledList.Item label="Secondary Transfer Chance">
            <Button
              content={interacts.transferchance_secondary + '%'}
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_transferchance_secondary',
                })
              }
            />
          </LabeledList.Item>
          <LabeledList.Item label="Secondary Transfer Location">
            <Button
              content={
                interacts.transferlocation_secondary
                  ? interacts.transferlocation_secondary
                  : 'Disabled'
              }
              onClick={() =>
                act('set_attribute', {
                  attribute: 'b_transferlocation_secondary',
                })
              }
            />
          </LabeledList.Item>
          <LabeledList.Divider />
          <LabeledList.Item label="Absorb Chance">
            <Button
              content={interacts.absorbchance + '%'}
              onClick={() =>
                act('set_attribute', { attribute: 'b_absorbchance' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Item label="Digest Chance">
            <Button
              content={interacts.digestchance + '%'}
              onClick={() =>
                act('set_attribute', { attribute: 'b_digestchance' })
              }
            />
          </LabeledList.Item>
          <LabeledList.Divider />
        </LabeledList>
      ) : (
        'These options only display while interactions are turned on.'
      )}
      <Section // RS Add Start || Port Chomp 2821, 3194, 6155
        title="Auto-Transfer Options"
        buttons={
          <Button
            onClick={() =>
              act('set_attribute', { attribute: 'b_autotransfer_enabled' })
            }
            icon={autotransfer_enabled ? 'toggle-on' : 'toggle-off'}
            selected={autotransfer_enabled}
            content={
              autotransfer_enabled
                ? 'Auto-Transfer Enabled'
                : 'Auto-Transfer Disabled'
            }
          />
        }>
        {autotransfer_enabled ? (
          <LabeledList>
            <LabeledList.Item label="Auto-Transfer Time">
              <Button
                content={autotransfer.autotransferwait / 10 + 's'}
                onClick={() =>
                  act('set_attribute', { attribute: 'b_autotransferwait' })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Chance">
              <Button
                content={autotransfer.autotransferchance + '%'}
                onClick={() =>
                  act('set_attribute', { attribute: 'b_autotransferchance' })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Location">
              <Button
                content={
                  autotransfer.autotransferlocation
                    ? autotransfer.autotransferlocation
                    : 'Disabled'
                }
                onClick={() =>
                  act('set_attribute', { attribute: 'b_autotransferlocation' })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Secondary Chance">
              <Button
                content={autotransfer.autotransferchance_secondary + '%'}
                onClick={() =>
                  act('set_attribute', {
                    attribute: 'b_autotransferchance_secondary',
                  })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Secondary Location">
              <Button
                content={
                  autotransfer.autotransferlocation_secondary
                    ? autotransfer.autotransferlocation_secondary
                    : 'Disabled'
                }
                onClick={() =>
                  act('set_attribute', {
                    attribute: 'b_autotransferlocation_secondary',
                  })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Min Amount">
              <Button
                content={autotransfer.autotransfer_min_amount}
                onClick={() =>
                  act('set_attribute', {
                    attribute: 'b_autotransfer_min_amount',
                  })
                }
              />
            </LabeledList.Item>
            <LabeledList.Item label="Auto-Transfer Max Amount">
              <Button
                content={autotransfer.autotransfer_max_amount}
                onClick={() =>
                  act('set_attribute', {
                    attribute: 'b_autotransfer_max_amount',
                  })
                }
              />
            </LabeledList.Item>
          </LabeledList>
        ) : (
          'These options only display while Auto-Transfer is enabled.'
        )}
      </Section>
    </Section> // RS Add End
  );
};

const VoreSelectedBellyLiquidOptions = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const {
    show_liq,
    liq_interacts,
    liq_reagent_gen,
    liq_reagent_type,
    liq_reagent_name,
    liq_reagent_transfer_verb,
    liq_reagent_nutri_rate,
    liq_reagent_capacity,
    liq_sloshing,
    liq_reagent_addons,
    show_liq_fullness,
    liq_messages,
    liq_msg1,
    liq_msg2,
    liq_msg3,
    liq_msg4,
    liq_msg5,
    custom_reagentcolor,
    custom_reagentalpha,
    liquid_overlay,
    mush_overlay,
    mush_color,
    mush_alpha,
    max_mush,
    min_mush,
  } = belly;

  return (
    <Section
      title="Liquid Options"
      buttons={
        <Button
          onClick={() =>
            act('liq_set_attribute', { liq_attribute: 'b_show_liq' })
          }
          icon={show_liq ? 'toggle-on' : 'toggle-off'}
          selected={show_liq}
          tooltipPosition="left"
          tooltip={
            'These are the settings for liquid bellies, every belly has a liquid storage.'
          }
          content={show_liq ? 'Liquids On' : 'Liquids Off'}
        />
      }>
      {show_liq ? (
        <LabeledList>
          <LabeledList.Item label="Generate Liquids">
            <Button
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_liq_reagent_gen' })
              }
              icon={liq_interacts.liq_reagent_gen ? 'toggle-on' : 'toggle-off'}
              selected={liq_interacts.liq_reagent_gen}
              content={liq_interacts.liq_reagent_gen ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Type">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_liq_reagent_type',
                })
              }
              icon="pen"
              content={liq_interacts.liq_reagent_type}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Name">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_liq_reagent_name',
                })
              }
              content={liq_interacts.liq_reagent_name}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Generation Time">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_liq_reagent_nutri_rate',
                })
              }
              icon="clock"
              content={
                ((liq_interacts.liq_reagent_nutri_rate + 1) * 10) / 60 +
                ' Hours'
              }
            />
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Capacity">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_liq_reagent_capacity',
                })
              }
              content={liq_interacts.liq_reagent_capacity}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Slosh Sounds">
            <Button
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_liq_sloshing' })
              }
              icon={liq_interacts.liq_sloshing ? 'toggle-on' : 'toggle-off'}
              selected={liq_interacts.liq_sloshing}
              content={liq_interacts.liq_sloshing ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Addons">
            {(liq_interacts.liq_reagent_addons.length &&
              liq_interacts.liq_reagent_addons.join(', ')) ||
              'None'}
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_liq_reagent_addons',
                })
              }
              ml={1}
              icon="plus"
            />
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Application to Prey">
            <Button
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_reagent_touches' })
              }
              icon={liq_interacts.reagent_touches ? 'toggle-on' : 'toggle-off'}
              selected={liq_interacts.reagent_touches}
              content={liq_interacts.reagent_touches ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Custom Liquid Color">
            <Box
              backgroundColor={custom_reagentcolor}
              width="20px"
              height="20px"
            />
            <Button
              icon="eye-dropper"
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_custom_reagentcolor',
                })
              }>
              Select Reagent Color
            </Button>
          </LabeledList.Item>
          <LabeledList.Item label="Liquid Overlay">
            <Button
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_liquid_overlay' })
              }
              icon={liq_interacts.liquid_overlay ? 'toggle-on' : 'toggle-off'}
              selected={liq_interacts.liquid_overlay}
              content={liq_interacts.liquid_overlay ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Max Liquid Level">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_max_liquid_level',
                })
              }
              content={liq_interacts.max_liquid_level + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Custom Liquid Alpha">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_custom_reagentalpha',
                })
              }
              content={liq_interacts.custom_reagentalpha}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Fullness Overlay">
            <Button
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_mush_overlay' })
              }
              icon={liq_interacts.mush_overlay ? 'toggle-on' : 'toggle-off'}
              selected={liq_interacts.mush_overlay}
              content={liq_interacts.mush_overlay ? 'On' : 'Off'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Mush Overlay Color">
            <Box backgroundColor={mush_color} width="20px" height="20px" />
            <Button
              icon="eye-dropper"
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_mush_color',
                })
              }>
              Select Mush Color
            </Button>
          </LabeledList.Item>
          <LabeledList.Item label="Mush Overlay Alpha">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_mush_alpha',
                })
              }
              content={liq_interacts.mush_alpha}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Mush Overlay Scaling">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_max_mush',
                })
              }
              content={liq_interacts.max_mush}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Minimum Mush Level">
            <Button
              onClick={() =>
                act('liq_set_attribute', {
                  liq_attribute: 'b_min_mush',
                })
              }
              content={liq_interacts.min_mush + '%'}
            />
          </LabeledList.Item>
          <LabeledList.Item label="Purge Liquids">
            <Button
              color="red"
              onClick={() =>
                act('liq_set_attribute', { liq_attribute: 'b_liq_purge' })
              }
              content="Purge Liquids"
            />
          </LabeledList.Item>
        </LabeledList>
      ) : (
        'These options only display while liquid settings are turned on.'
      )}
    </Section>
  );
};

const VoreSelectedBellyLiquidMessages = (props, context) => {
  const { act } = useBackend(context);

  const { belly } = props;
  const {
    show_liq,
    liq_interacts,
    liq_reagent_gen,
    liq_reagent_type,
    liq_reagent_name,
    liq_reagent_nutri_rate,
    liq_reagent_capacity,
    liq_sloshing,
    liq_reagent_addons,
    show_liq_fullness,
    liq_messages,
    liq_msg_toggle1,
    liq_msg_toggle2,
    liq_msg_toggle3,
    liq_msg_toggle4,
    liq_msg_toggle5,
    liq_msg1,
    liq_msg2,
    liq_msg3,
    liq_msg4,
    liq_msg5,
    custom_reagentcolor,
    custom_reagentalpha,
    liquid_overlay,
    max_liquid_level,
    reagent_touches,
    mush_overlay,
    mush_color,
    mush_alpha,
    max_mush,
    min_mush,
  } = belly;

  return (
    <Section
      title="Liquid Messages"
      buttons={
        <Button
          onClick={() =>
            act('liq_set_messages', { liq_messages: 'b_show_liq_fullness' })
          }
          icon={show_liq_fullness ? 'toggle-on' : 'toggle-off'}
          selected={show_liq_fullness}
          tooltipPosition="left"
          tooltip={
            'These are the settings for belly visibility when involving liquids fullness.'
          }
          content={show_liq_fullness ? 'Messages On' : 'Messages Off'}
        />
      }>
      {show_liq_fullness ? (
        <LabeledList>
          <LabeledList.Item label="0 to 20%">
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg_toggle1' })
              }
              icon={liq_messages.liq_msg_toggle1 ? 'toggle-on' : 'toggle-off'}
              selected={liq_messages.liq_msg_toggle1}
              content={liq_messages.liq_msg_toggle1 ? 'On' : 'Off'}
            />
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg1' })
              }
              content="Examine Message (0 to 20%)"
            />
          </LabeledList.Item>
          <LabeledList.Item label="20 to 40%">
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg_toggle2' })
              }
              icon={liq_messages.liq_msg_toggle2 ? 'toggle-on' : 'toggle-off'}
              selected={liq_messages.liq_msg_toggle2}
              content={liq_messages.liq_msg_toggle2 ? 'On' : 'Off'}
            />
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg2' })
              }
              content="Examine Message (20 to 40%)"
            />
          </LabeledList.Item>
          <LabeledList.Item label="40 to 60%">
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg_toggle3' })
              }
              icon={liq_messages.liq_msg_toggle3 ? 'toggle-on' : 'toggle-off'}
              selected={liq_messages.liq_msg_toggle3}
              content={liq_messages.liq_msg_toggle3 ? 'On' : 'Off'}
            />
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg3' })
              }
              content="Examine Message (40 to 60%)"
            />
          </LabeledList.Item>
          <LabeledList.Item label="60 to 80%">
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg_toggle4' })
              }
              icon={liq_messages.liq_msg_toggle4 ? 'toggle-on' : 'toggle-off'}
              selected={liq_messages.liq_msg_toggle4}
              content={liq_messages.liq_msg_toggle4 ? 'On' : 'Off'}
            />
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg4' })
              }
              content="Examine Message (60 to 80%)"
            />
          </LabeledList.Item>
          <LabeledList.Item label="80 to 100%">
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg_toggle5' })
              }
              icon={liq_messages.liq_msg_toggle5 ? 'toggle-on' : 'toggle-off'}
              selected={liq_messages.liq_msg_toggle5}
              content={liq_messages.liq_msg_toggle5 ? 'On' : 'Off'}
            />
            <Button
              onClick={() =>
                act('liq_set_messages', { liq_messages: 'b_liq_msg5' })
              }
              content="Examine Message (80 to 100%)"
            />
          </LabeledList.Item>
        </LabeledList>
      ) : (
        'These options only display while liquid examination settings are turned on.'
      )}
    </Section>
  );
};

const VoreContentsPanel = (props, context) => {
  const { act, data } = useBackend(context);
  const { show_pictures } = data;
  const { contents, belly, outside = false } = props;

  return (
    <Fragment>
      {(outside && (
        <Button
          textAlign="center"
          fluid
          mb={1}
          onClick={() => act('pick_from_outside', { pickall: true })}>
          All
        </Button>
      )) ||
        null}
      {(show_pictures && (
        <Flex wrap="wrap" justify="center" align="center">
          {contents.map((thing) => (
            <Flex.Item key={thing.name} basis="33%">
              <Button
                width="64px"
                color={thing.absorbed ? 'purple' : stats[thing.stat]}
                style={{
                  'vertical-align': 'middle',
                  'margin-right': '5px',
                  'border-radius': '20px',
                }}
                onClick={() =>
                  act(
                    thing.outside ? 'pick_from_outside' : 'pick_from_inside',
                    {
                      pick: thing.ref,
                      belly: belly,
                    }
                  )
                }>
                <img
                  src={'data:image/jpeg;base64, ' + thing.icon}
                  width="64px"
                  height="64px"
                  style={{
                    '-ms-interpolation-mode': 'nearest-neighbor',
                    'margin-left': '-5px',
                  }}
                />
              </Button>
              {thing.name}
            </Flex.Item>
          ))}
        </Flex>
      )) || (
        <LabeledList>
          {contents.map((thing) => (
            <LabeledList.Item key={thing.ref} label={thing.name}>
              <Button
                fluid
                mt={-1}
                mb={-1}
                color={thing.absorbed ? 'purple' : stats[thing.stat]}
                onClick={() =>
                  act(
                    thing.outside ? 'pick_from_outside' : 'pick_from_inside',
                    {
                      pick: thing.ref,
                      belly: belly,
                    }
                  )
                }>
                Interact
              </Button>
            </LabeledList.Item>
          ))}
        </LabeledList>
      )}
    </Fragment>
  );
};

const VoreUserPreferences = (props, context) => {
  const { act, data } = useBackend(context);

  const {
    digestable,
    devourable,
    resizable,
    feeding,
    absorbable,
    digest_leave_remains,
    allowmobvore,
    permit_healbelly,
    show_vore_fx,
    can_be_drop_prey,
    can_be_drop_pred,
    allow_inbelly_spawning,
    allow_spontaneous_tf,
    step_mechanics_active,
    pickup_mechanics_active,
    noisy,
    drop_vore,
    stumble_vore,
    slip_vore,
    throw_vore,
    food_vore,
    nutrition_message_visible,
    weight_message_visible,
    eating_privacy_global,
    allowstripping,
    allowcontamination,
    allowssdvore,
    glowing_belly,
    autotransferable,
  } = data.prefs;

  const { show_pictures } = data;

  const preferences = {
    belly_glow: {
      action: 'toggle_glow',
      test: glowing_belly,
      tooltip: {
        main: 'This button is to make your stomach glow or not!',
        enable: 'Click here to have your stomach glow!',
        disable: 'Click here to have your stomach be normal.',
      },
      content: {
        enabled: 'Glowing',
        disabled: 'Not Glowing',
      },
    },
    digestion: {
      action: 'toggle_digest',
      test: digestable,
      tooltip: {
        main: "This button is for those who don't like being digested. It can make you undigestable.",
        enable: 'Click here to allow digestion.',
        disable: 'Click here to prevent digestion.',
      },
      content: {
        enabled: 'Digestion Allowed',
        disabled: 'No Digestion',
      },
    },
    absorbable: {
      action: 'toggle_absorbable',
      test: absorbable,
      tooltip: {
        main: "This button allows preds to know whether you prefer or don't prefer to be absorbed.",
        enable: 'Click here to allow being absorbed.',
        disable: 'Click here to disallow being absorbed.',
      },
      content: {
        enabled: 'Absorption Allowed',
        disabled: 'No Absorption',
      },
    },
    devour: {
      action: 'toggle_devour',
      test: devourable,
      tooltip: {
        main: 'This button is to toggle your ability to be devoured by others.',
        enable: 'Click here to allow being devoured.',
        disable: 'Click here to prevent being devoured.',
      },
      content: {
        enabled: 'Devouring Allowed',
        disabled: 'No Devouring',
      },
    },
    mobvore: {
      action: 'toggle_mobvore',
      test: allowmobvore,
      tooltip: {
        main: "This button is for those who don't like being eaten by mobs.",
        enable: 'Click here to allow being eaten by mobs.',
        disable: 'Click here to prevent being eaten by mobs.',
      },
      content: {
        enabled: 'Mobs eating you allowed',
        disabled: 'No Mobs eating you',
      },
    },
    feed: {
      action: 'toggle_feed',
      test: feeding,
      tooltip: {
        main: 'This button is to toggle your ability to be fed to or by others vorishly.',
        enable: 'Click here to allow being fed to/by other people.',
        disable: 'Click here to prevent being fed to/by other people.',
      },
      content: {
        enabled: 'Feeding Allowed',
        disabled: 'No Feeding',
      },
    },
    healbelly: {
      action: 'toggle_healbelly',
      test: permit_healbelly,
      tooltip: {
        main:
          "This button is for those who don't like healbelly used on them as a mechanic." +
          ' It does not affect anything, but is displayed under mechanical prefs for ease of quick checks.',
        enable: 'Click here to allow being heal-bellied.',
        disable: 'Click here to prevent being heal-bellied.',
      },
      content: {
        enabled: 'Heal-bellies Allowed',
        disabled: 'No Heal-bellies',
      },
    },
    dropnom_prey: {
      action: 'toggle_dropnom_prey',
      test: can_be_drop_prey,
      tooltip: {
        main:
          'This toggle is for spontaneous, environment related vore' +
          ' as prey, including drop-noms, teleporters, etc.',
        enable: 'Click here to allow being spontaneous prey.',
        disable: 'Click here to prevent being spontaneous prey.',
      },
      content: {
        enabled: 'Spontaneous Prey Enabled',
        disabled: 'Spontaneous Prey Disabled',
      },
    },
    dropnom_pred: {
      action: 'toggle_dropnom_pred',
      test: can_be_drop_pred,
      tooltip: {
        main:
          'This toggle is for spontaneous, environment related vore' +
          ' as a predator, including drop-noms, teleporters, etc.',
        enable: 'Click here to allow being spontaneous pred.',
        disable: 'Click here to prevent being spontaneous pred.',
      },
      content: {
        enabled: 'Spontaneous Pred Enabled',
        disabled: 'Spontaneous Pred Disabled',
      },
    },
    toggle_drop_vore: {
      action: 'toggle_drop_vore',
      test: drop_vore,
      tooltip: {
        main:
          'Allows for dropnom spontaneous vore to occur. ' +
          'Note, you still need spontaneous vore pred and/or prey enabled.',
        enable: 'Click here to allow for dropnoms.',
        disable: 'Click here to disable dropnoms.',
      },
      content: {
        enabled: 'Drop Noms Enabled',
        disabled: 'Drop Noms Disabled',
      },
    },
    toggle_slip_vore: {
      action: 'toggle_slip_vore',
      test: slip_vore,
      tooltip: {
        main:
          'Allows for slip related spontaneous vore to occur. ' +
          'Note, you still need spontaneous vore pred and/or prey enabled.',
        enable: 'Click here to allow for slip vore.',
        disable: 'Click here to disable slip vore.',
      },
      content: {
        enabled: 'Slip Vore Enabled',
        disabled: 'Slip Vore Disabled',
      },
    },
    toggle_stumble_vore: {
      action: 'toggle_stumble_vore',
      test: stumble_vore,
      tooltip: {
        main:
          'Allows for stumble related spontaneous vore to occur. ' +
          ' Note, you still need spontaneous vore pred and/or prey enabled.',
        enable: 'Click here to allow for stumble vore.',
        disable: 'Click here to disable stumble vore.',
      },
      content: {
        enabled: 'Stumble Vore Enabled',
        disabled: 'Stumble Vore Disabled',
      },
    },
    toggle_throw_vore: {
      action: 'toggle_throw_vore',
      test: throw_vore,
      tooltip: {
        main:
          'Allows for throw related spontaneous vore to occur. ' +
          ' Note, you still need spontaneous vore pred and/or prey enabled.',
        enable: 'Click here to allow for throw vore.',
        disable: 'Click here to disable throw vore.',
      },
      content: {
        enabled: 'Throw Vore Enabled',
        disabled: 'Throw Vore Disabled',
      },
    },
    toggle_food_vore: {
      action: 'toggle_food_vore',
      test: food_vore,
      tooltip: {
        main:
          'Allows for food related spontaneous vore to occur. ' +
          ' Note, you still need spontaneous vore pred and/or prey enabled.',
        enable: 'Click here to allow for food vore.',
        disable: 'Click here to disable food vore.',
      },
      content: {
        enabled: 'Food Vore Enabled',
        disabled: 'Food Vore Disabled',
      },
    },
    inbelly_spawning: {
      action: 'toggle_allow_inbelly_spawning',
      test: allow_inbelly_spawning,
      tooltip: {
        main:
          'This toggle is ghosts being able to spawn in one of your bellies.' +
          ' You will have to confirm again when they attempt to.',
        enable: 'Click here to allow prey to spawn in you.',
        disable: 'Click here to prevent prey from spawning in you.',
      },
      content: {
        enabled: 'Inbelly Spawning Allowed',
        disabled: 'Inbelly Spawning Forbidden',
      },
    },
    noisy: {
      action: 'toggle_noisy',
      test: noisy,
      tooltip: {
        main: 'Toggle audible hunger noises.',
        enable: 'Click here to turn on hunger noises.',
        disable: 'Click here to turn off hunger noises.',
      },
      content: {
        enabled: 'Hunger Noises Enabled',
        disabled: 'Hunger Noises Disabled',
      },
    },
    resize: {
      action: 'toggle_resize',
      test: resizable,
      tooltip: {
        main: 'This button is to toggle your ability to be resized by others.',
        enable: 'Click here to allow being resized.',
        disable: 'Click here to prevent being resized.',
      },
      content: {
        enabled: 'Resizing Allowed',
        disabled: 'No Resizing',
      },
    },
    steppref: {
      action: 'toggle_steppref',
      test: step_mechanics_active,
      tooltip: {
        main: '',
        enable:
          'You will not participate in step mechanics.' +
          ' Click to enable step mechanics.',
        disable:
          'This setting controls whether or not you participate in size-based step mechanics.' +
          ' Includes both stepping on others, as well as getting stepped on. Click to disable step mechanics.',
      },
      content: {
        enabled: 'Step Mechanics Enabled',
        disabled: 'Step Mechanics Disabled',
      },
    },
    vore_fx: {
      action: 'toggle_fx',
      test: show_vore_fx,
      tooltip: {
        main: '',
        enable:
          'Regardless of Predator Setting, you will not see their FX settings.' +
          ' Click this to enable showing FX.',
        disable:
          'This setting controls whether or not a pred is allowed to mess with your HUD and fullscreen overlays.' +
          ' Click to disable all FX.',
      },
      content: {
        enabled: 'Show Vore FX',
        disabled: 'Do Not Show Vore FX',
      },
    },
    remains: {
      action: 'toggle_leaveremains',
      test: digest_leave_remains,
      tooltip: {
        main: '',
        enable:
          'Regardless of Predator Setting, you will not leave remains behind.' +
          ' Click this to allow leaving remains.',
        disable:
          'Your Predator must have this setting enabled in their belly modes to allow remains to show up,' +
          ' if they do not, they will not leave your remains behind, even with this on. Click to disable remains.',
      },
      content: {
        enabled: 'Allow Leaving Remains',
        disabled: 'Do Not Allow Leaving Remains',
      },
    },
    allow_contamination: {
      action: 'toggle_allowcontamination',
      test: allowcontamination,
      tooltip: {
        main: '',
        enable:
          'Regardless of Predator Setting, your worn items will not be contaminated.' +
          ' Click this to enable contamination.',
        disable:
          'This setting controls whether or not a pred is allowed to contaminate your worn items.' +
          ' Click to disable contamination.',
      },
      content: {
        enabled: 'Allow Contamination',
        disabled: 'Disallow Contamination',
      },
    },
    allow_stripping: {
      action: 'toggle_allowstripping',
      test: allowstripping,
      tooltip: {
        main: '',
        enable:
          'Regardless of Predator Setting, your worn items will not be stripped.' +
          ' Click this to enable stripping.',
        disable:
          'This setting controls whether or not a pred is allowed to strip your worn items.' +
          ' Click to disable contamination.',
      },
      content: {
        enabled: 'Allow Stripping',
        disabled: 'Disallow Stripping',
      },
    },
    allow_ssdvore: {
      action: 'toggle_allowssdvore',
      test: allowssdvore,
      tooltip: {
        main: '',
        enable:
          'You cannot be eaten while disconnected.' +
          ' Click this to enable SSD vore.',
        disable:
          'This setting controls whether or not you can be eaten while disconnected.' +
          ' Click to disable SSD vore.',
      },
      content: {
        enabled: 'Allow SSD Vore',
        disabled: 'Disallow SSD Vore',
      },
    },
    autotransferable: {
      action: 'toggle_autotransferable',
      test: autotransferable,
      tooltip: {
        main: 'This button is for allowing or preventing belly auto-transfer mechanics from moving you.',
        enable: 'Click here to allow autotransfer.',
        disable: 'Click here to prevent autotransfer.',
      },
      content: {
        enabled: 'Auto-Transfer Allowed',
        disabled: 'Do Not Allow Auto-Transfer',
      },
    },
    pickuppref: {
      action: 'toggle_pickuppref',
      test: pickup_mechanics_active,
      tooltip: {
        main: '',
        enable:
          'You will not participate in pick-up mechanics.' +
          ' Click this to allow picking up/being picked up.',
        disable:
          'Allows macros to pick you up into their hands, and you to pick up micros.' +
          ' Click to disable pick-up mechanics.',
      },
      content: {
        enabled: 'Pick-up Mechanics Enabled',
        disabled: 'Pick-up Mechanics Disabled',
      },
    },
    spontaneous_tf: {
      action: 'toggle_allow_spontaneous_tf',
      test: allow_spontaneous_tf,
      tooltip: {
        main:
          'This toggle is for spontaneous or environment related transformation' +
          ' as a victim, such as via chemicals.',
        enable: 'Click here to allow being spontaneously transformed.',
        disable: 'Click here to disable being spontaneously transformed.',
      },
      content: {
        enabled: 'Spontaneous TF Enabled',
        disabled: 'Spontaneous TF Disabled',
      },
    },
    examine_nutrition: {
      action: 'toggle_nutrition_ex',
      test: nutrition_message_visible,
      tooltip: {
        main: '',
        enable: 'Click here to enable nutrition messages.',
        disable: 'Click here to disable nutrition messages.',
      },
      content: {
        enabled: 'Examine Nutrition Messages Active',
        disabled: 'Examine Nutrition Messages Inactive',
      },
    },
    examine_weight: {
      action: 'toggle_weight_ex',
      test: weight_message_visible,
      tooltip: {
        main: '',
        enable: 'Click here to enable weight messages.',
        disable: 'Click here to disable weight messages.',
      },
      content: {
        enabled: 'Examine Weight Messages Active',
        disabled: 'Examine Weight Messages Inactive',
      },
    },
    eating_privacy_global: {
      action: 'toggle_global_privacy',
      test: eating_privacy_global,
      tooltip: {
        main:
          'Sets default belly behaviour for vorebellies for announcing' +
          ' ingesting or expelling prey' +
          ' Overwritten by belly-specific preferences if set.',
        enable: ' Click here to turn your messages subtle',
        disable: ' Click here to turn your  messages loud',
      },
      content: {
        enabled: 'Global Vore Privacy: Subtle',
        disabled: 'Global Vore Privacy: Loud',
      },
    },
  };

  return (
    <Section
      title="Mechanical Preferences"
      buttons={
        <Button
          icon="eye"
          selected={show_pictures}
          onClick={() => act('show_pictures')}>
          Contents Preference: {show_pictures ? 'Show Pictures' : 'Show List'}
        </Button>
      }>
      <Flex spacing={1} wrap="wrap" justify="center">
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.digestion} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.absorbable} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.devour} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.mobvore} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.feed} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem
            spec={preferences.healbelly}
            tooltipPosition="top"
          />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.dropnom_prey} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.dropnom_pred} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.toggle_drop_vore} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.toggle_slip_vore} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.toggle_stumble_vore} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.toggle_throw_vore} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.toggle_food_vore} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.inbelly_spawning} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.noisy} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.resize} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem
            spec={preferences.steppref}
            tooltipPosition="top"
          />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem
            spec={preferences.vore_fx}
            tooltipPosition="top"
          />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem
            spec={preferences.remains}
            tooltipPosition="top"
          />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem
            spec={preferences.pickuppref}
            tooltipPosition="top"
          />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.spontaneous_tf} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.allow_stripping} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={1}>
          <VoreUserPreferenceItem spec={preferences.allow_contamination} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.allow_ssdvore} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.autotransferable} />
        </Flex.Item>
        <Flex.Item basis="32%" grow={3}>
          <Button
            fluid
            content="Selective Mode Preference"
            onClick={() => act('switch_selective_mode_pref')}
          />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.eating_privacy_global} />
        </Flex.Item>
        <Flex.Item basis="32%">
          <VoreUserPreferenceItem spec={preferences.belly_glow} />
        </Flex.Item>
      </Flex>
      <Section title="Aesthetic Preferences">
        <Flex spacing={1} wrap="wrap" justify="center">
          <Flex.Item basis="50%" grow={1}>
            <Button
              fluid
              content="Set Taste"
              icon="grin-tongue"
              onClick={() => act('setflavor')}
            />
          </Flex.Item>
          <Flex.Item basis="50%">
            <Button
              fluid
              content="Set Smell"
              icon="wind"
              onClick={() => act('setsmell')}
            />
          </Flex.Item>
          <Flex.Item basis="50%" grow={1}>
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_msgs', msgtype: 'en' })
              }
              content="Set Nutrition Examine Message"
              icon="flask"
              fluid
            />
          </Flex.Item>
          <Flex.Item basis="50%">
            <Button
              onClick={() =>
                act('set_attribute', { attribute: 'b_msgs', msgtype: 'ew' })
              }
              content="Set Weight Examine Message"
              icon="weight-hanging"
              fluid
            />
          </Flex.Item>
          <Flex.Item basis="50%" grow={1}>
            <VoreUserPreferenceItem spec={preferences.examine_nutrition} />
          </Flex.Item>
          <Flex.Item basis="50%">
            <VoreUserPreferenceItem spec={preferences.examine_weight} />
          </Flex.Item>
          <Flex.Item basis="50%">
            <Button
              fluid
              content="Vore Sprite Color"
              onClick={() => act('set_vs_color')}
            />
          </Flex.Item>
        </Flex>
      </Section>
      <Divider />
      <Section>
        <Flex spacing={1}>
          <Flex.Item basis="49%">
            <Button
              fluid
              content="Save Prefs"
              icon="save"
              onClick={() => act('saveprefs')}
            />
          </Flex.Item>
          <Flex.Item basis="49%" grow={1}>
            <Button
              fluid
              content="Reload Prefs"
              icon="undo"
              onClick={() => act('reloadprefs')}
            />
          </Flex.Item>
        </Flex>
      </Section>
    </Section>
  );
};

const VoreUserPreferenceItem = (props, context) => {
  const { act } = useBackend(context);

  const { spec, ...rest } = props;
  const { action, test, tooltip, content } = spec;

  return (
    <Button
      onClick={() => act(action)}
      icon={test ? 'toggle-on' : 'toggle-off'}
      selected={test}
      fluid
      tooltip={tooltip.main + ' ' + (test ? tooltip.disable : tooltip.enable)}
      content={test ? content.enabled : content.disabled}
      {...rest}
    />
  );
};
