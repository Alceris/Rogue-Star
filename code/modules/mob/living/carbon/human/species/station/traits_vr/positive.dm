/datum/trait/positive
	category = TRAIT_TYPE_POSITIVE
/* - RS REMOVAL - Increased base speed, removed haste
/datum/trait/positive/speed_fast
	name = "Haste"
	desc = "Allows you to move faster on average than baseline."
	cost = 4
	var_changes = list("slowdown" = 0)	//RS EDIT - PENDING POTENTIAL REMOVAL DUE TO INCREASED BASE SPEED
*/
/datum/trait/positive/hardy
	name = "Hardy"
	desc = "Allows you to carry heavy equipment with less slowdown."
	cost = 1
	var_changes = list("item_slowdown_mod" = 0.5)

/datum/trait/positive/hardy_plus
	name = "Hardy, Major"
	desc = "Allows you to carry heavy equipment with almost no slowdown."
	cost = 2
	var_changes = list("item_slowdown_mod" = 0.25)

/datum/trait/positive/endurance_high
	name = "High Endurance"
	desc = "Increases your maximum total hitpoints to 125"
	cost = 4
	var_changes = list("total_health" = 125)

/datum/trait/positive/endurance_high/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.setMaxHealth(S.total_health)

/datum/trait/positive/nonconductive
	name = "Non-Conductive"
	desc = "Decreases your susceptibility to electric shocks by a 10% amount."
	cost = 1 //This effects tasers!
	var_changes = list("siemens_coefficient" = 0.9)

/datum/trait/positive/nonconductive_plus
	name = "Non-Conductive, Major"
	desc = "Decreases your susceptibility to electric shocks by a 25% amount."
	cost = 2 //Let us not forget this effects tasers!
	var_changes = list("siemens_coefficient" = 0.75)

/datum/trait/positive/darksight
	name = "Darksight"
	desc = "Allows you to see a short distance in the dark."
	cost = 1
	var_changes = list("darksight" = 5, "flash_mod" = 1.1)

/datum/trait/positive/darksight_plus
	name = "Darksight, Major"
	desc = "Allows you to see in the dark for the whole screen."
	cost = 2
	var_changes = list("darksight" = 8, "flash_mod" = 1.2)

/datum/trait/positive/melee_attack
	name = "Special Attack: Sharp Melee" // Trait Organization for easier browsing. TODO: Proper categorization of 'health/ability/resist/etc'
	desc = "Provides sharp melee attacks that do slightly more damage."
	cost = 1
	var_changes = list("unarmed_types" = list(/datum/unarmed_attack/stomp, /datum/unarmed_attack/kick, /datum/unarmed_attack/claws, /datum/unarmed_attack/bite/sharp))

/* - RS REMOVAL - Rolling numbing enzyme into a trait that lets you inject it without also killing them.
/datum/trait/positive/melee_attack_fangs
	name = "Special Attack: Sharp Melee & Numbing Fangs" // Trait Organization for easier browsing. TODO: Proper categorization of 'health/ability/resist/etc'
	desc = "Provides sharp melee attacks that do slightly more damage, along with fangs that makes the person bit unable to feel their body or pain."
	cost = 2
	var_changes = list("unarmed_types" = list(/datum/unarmed_attack/stomp, /datum/unarmed_attack/kick, /datum/unarmed_attack/claws, /datum/unarmed_attack/bite/sharp, /datum/unarmed_attack/bite/sharp/numbing))

/datum/trait/positive/fangs
	name = "Special Attack: Numbing Fangs" // Trait Organization for easier browsing. TODO: Proper categorization of 'health/ability/resist/etc'
	desc = "Provides fangs that makes the person bit unable to feel their body or pain."
	cost = 1
	var_changes = list("unarmed_types" = list(/datum/unarmed_attack/stomp, /datum/unarmed_attack/kick, /datum/unarmed_attack/punch, /datum/unarmed_attack/bite/sharp/numbing))
*/

//RS ADD START
/*
/datum/trait/positive/shrinkinject
	name = "Venom: Microcillin"
	desc = "Provides the ability to inject a shrinking chemical into others, through a bite, or sting, or however else."
	cost = 1
	excludes = list(
		/datum/trait/positive/growinject,
		/datum/trait/positive/sizeinject,
		/datum/trait/positive/numbinject,
		/datum/trait/positive/omniinject
		)
	has_preferences = list("trait_injection_verb" = list(TRAIT_PREF_TYPE_STRING, "Verb", TRAIT_VAREDIT_TARGET_MOB, "bites"))
	custom_only = FALSE

/datum/trait/positive/shrinkinject/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/injection
	H.trait_injection_reagents += "microcillin"

/datum/trait/positive/growinject
	name = "Venom: Macrocillin"
	desc = "Provides the ability to inject a growing chemical into others, through a bite, or sting, or however else."
	cost = 1
	excludes = list(
		/datum/trait/positive/shrinkinject,
		/datum/trait/positive/sizeinject,
		/datum/trait/positive/numbinject,
		/datum/trait/positive/omniinject
		)
	has_preferences = list("trait_injection_verb" = list(TRAIT_PREF_TYPE_STRING, "Verb", TRAIT_VAREDIT_TARGET_MOB, "bites"))
	custom_only = FALSE

/datum/trait/positive/growinject/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/injection
	H.trait_injection_reagents += "macrocillin"

/datum/trait/positive/sizeinject
	name = "Venom: Size changing (all)"
	desc = "Provides the ability to inject all manner of size changing chemicals into others, through a bite, or sting, or however else."
	cost = 1
	excludes = list(
		/datum/trait/positive/shrinkinject,
		/datum/trait/positive/growinject,
		/datum/trait/positive/numbinject,
		/datum/trait/positive/omniinject
		)
	has_preferences = list("trait_injection_verb" = list(TRAIT_PREF_TYPE_STRING, "Verb", TRAIT_VAREDIT_TARGET_MOB, "bites"))
	custom_only = FALSE

/datum/trait/positive/sizeinject/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/injection
	H.trait_injection_reagents += "microcillin"
	H.trait_injection_reagents += "macrocillin"
	H.trait_injection_reagents += "normalcillin"

/datum/trait/positive/numbinject
	name = "Venom: Numbing"
	desc = "Provides the ability to inject chemicals that make others unable to feel their body or pain."
	cost = 1
	excludes = list(
		/datum/trait/positive/shrinkinject,
		/datum/trait/positive/growinject,
		/datum/trait/positive/sizeinject,
		/datum/trait/positive/omniinject
		)
	custom_only = FALSE
	has_preferences = list("trait_injection_verb" = list(TRAIT_PREF_TYPE_STRING, "Verb", TRAIT_VAREDIT_TARGET_MOB, "bites"))

/datum/trait/positive/numbinject/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/injection
	H.trait_injection_reagents += "numbenzyme"

/datum/trait/positive/omniinject
	name = "Venom: All"
	desc = "Provides the ability to inject chemicals that make others unable to feel their body or pain, and also size changing chemicals."
	cost = 1
	excludes = list(
		/datum/trait/positive/shrinkinject,
		/datum/trait/positive/growinject,
		/datum/trait/positive/sizeinject,
		/datum/trait/positive/numbinject
		)
	custom_only = FALSE
	has_preferences = list("trait_injection_verb" = list(TRAIT_PREF_TYPE_STRING, "Verb", TRAIT_VAREDIT_TARGET_MOB, "bites"))

/datum/trait/positive/omniinject/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/injection
	H.trait_injection_reagents += "numbenzyme"
	H.trait_injection_reagents += "microcillin"
	H.trait_injection_reagents += "macrocillin"
	H.trait_injection_reagents += "normalcillin"

//RS ADD END
*/

/datum/trait/positive/minor_brute_resist
	name = "Brute Resist, Minor"
	desc = "Adds 15% resistance to brute damage sources."
	cost = 2
	var_changes = list("brute_mod" = 0.85)

/datum/trait/positive/brute_resist
	name = "Brute Resist"
	desc = "Adds 25% resistance to brute damage sources."
	cost = 3
	var_changes = list("brute_mod" = 0.75)
	excludes = list(/datum/trait/positive/minor_burn_resist,/datum/trait/positive/burn_resist)

/datum/trait/positive/minor_burn_resist
	name = "Burn Resist, Minor"
	desc = "Adds 15% resistance to burn damage sources."
	cost = 2
	var_changes = list("burn_mod" = 0.85)

/datum/trait/positive/burn_resist
	name = "Burn Resist"
	desc = "Adds 25% resistance to burn damage sources."
	cost = 3
	var_changes = list("burn_mod" = 0.75)
	excludes = list(/datum/trait/positive/minor_brute_resist,/datum/trait/positive/brute_resist)

/datum/trait/positive/photoresistant
	name = "Photoresistant"
	desc = "Decreases stun duration from flashes and other light-based stuns and disabilities by 20%"
	cost = 1
	var_changes = list("flash_mod" = 0.8)

/datum/trait/positive/winged_flight
	name = "Winged Flight"
	desc = "Allows you to fly by using your wings. Don't forget to bring them!"
	cost = 0
	has_preferences = list("flight_vore" = list(TRAIT_PREF_TYPE_BOOLEAN, "Flight Vore enabled on spawn", TRAIT_VAREDIT_TARGET_MOB, FALSE))

/datum/trait/positive/winged_flight/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/flying_toggle
	H.verbs |= /mob/living/proc/flying_vore_toggle
	H.verbs |= /mob/living/proc/start_wings_hovering

/datum/trait/positive/soft_landing
	name = "Soft Landing"
	desc = "You can fall from certain heights without suffering any injuries, be it via wings, lightness of frame or general dexterity."
	cost = 1
	var_changes = list("soft_landing" = TRUE)
	custom_only = FALSE
	excludes = list(					//RS ADD
		/datum/trait/negative/clumsy
		)

/datum/trait/positive/antiseptic_saliva
	name = "Antiseptic Saliva"
	desc = "Your saliva has especially strong antiseptic properties that can be used to heal small wounds."
	cost = 1

/datum/trait/positive/antiseptic_saliva/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/carbon/human/proc/lick_wounds

/datum/trait/positive/traceur
	name = "Traceur"
	desc = "You're capable of parkour and can *flip over low objects (most of the time)."
	cost = 2
	var_changes = list("agility" = 90)
	custom_only = FALSE
	varchange_type = TRAIT_VARCHANGE_MORE_BETTER

/datum/trait/positive/snowwalker
	name = "Snow Walker"
	desc = "You are able to move unhindered on snow."
	cost = 1
	var_changes = list("snow_movement" = -2)

/datum/trait/positive/weaver
	name = "Weaver"
	desc = "You can produce silk and create various articles of clothing and objects."
	cost = 2
	var_changes = list("is_weaver" = 1)
	has_preferences = list("silk_production" = list(TRAIT_PREF_TYPE_BOOLEAN, "Silk production on spawn", TRAIT_VAREDIT_TARGET_SPECIES), \
							"silk_color" = list(TRAIT_PREF_TYPE_COLOR, "Silk color", TRAIT_VAREDIT_TARGET_SPECIES))

/datum/trait/positive/weaver/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/carbon/human/proc/check_silk_amount
	H.verbs |= /mob/living/carbon/human/proc/toggle_silk_production
	H.verbs |= /mob/living/carbon/human/proc/weave_structure
	H.verbs |= /mob/living/carbon/human/proc/weave_item
	H.verbs |= /mob/living/carbon/human/proc/set_silk_color

/datum/trait/positive/aquatic
	name = "Aquatic"
	desc = "You can breathe under water and can traverse water more efficiently. Additionally, you can eat others in the water."
	cost = 1
	var_changes = list("water_breather" = 1, "water_movement" = -4) //Negate shallow water. Half the speed in deep water.

/datum/trait/positive/aquatic/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/carbon/human/proc/water_stealth
	H.verbs |= /mob/living/carbon/human/proc/underwater_devour
	H.verbs |= /mob/living/carbon/human/proc/rushdown //RS Edit

/datum/trait/positive/cocoon_tf
	name = "Cocoon Spinner"
	desc = "Allows you to build a cocoon around yourself, using it to transform your body if you desire."
	cost = 1

/datum/trait/positive/cocoon_tf/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/carbon/human/proc/enter_cocoon

/datum/trait/positive/linguist
	name = "Linguist"
	desc = "Allows you to have more languages."
	cost = 1
	var_changes = list("num_alternate_languages" = 6)
	var_changes_pref = list("extra_languages" = 3)
	custom_only = FALSE
	varchange_type = TRAIT_VARCHANGE_MORE_BETTER

/datum/trait/positive/good_shooter
	name = "Eagle Eye"
	desc = "You are better at aiming than most."
	cost = 2
	var_changes = list("gun_accuracy_mod" = 25)
	custom_only = FALSE
	varchange_type = TRAIT_VARCHANGE_MORE_BETTER

/datum/trait/positive/pain_tolerance
	name = "Grit"
	desc = "You can keep going a little longer, a little harder when you get hurt, Injuries only inflict 85% as much pain, and slowdown from pain is 85% as effective."
	cost = 2
	var_changes = list("trauma_mod" = 0.85)
	excludes = list(/datum/trait/negative/neural_hypersensitivity)
	can_take = ORGANICS

/datum/trait/positive/throw_resistance
	name = "Firm Body"
	desc = "Your body is firm enough that small thrown items can't do anything to you."
	cost = 1
	var_changes = list("throwforce_absorb_threshold" = 10)




/datum/trait/positive/wall_climber
	name = "Climber, Amateur"
	desc = "You can climb certain walls without tools! This is likely a personal skill you developed."
	tutorial = "You must approach a wall and right click it and select the \
	'climb wall' verb to climb it. You suffer from a movement delay of 1.5 with this trait.\n \
	Your total climb time is expected to be 17.5 seconds. Tools may reduce this. \n\n \
	This likewise allows descending walls, provided you're facing an empty space and standing on \
	a climbable wall. To climbe like so, use the verb 'Climb Down Wall' in IC tab!"
	cost = 1
	custom_only = FALSE
	banned_species = list(SPECIES_TAJ, SPECIES_VASILISSAN)	// They got unique climbing delay.
	var_changes = list("can_climb" = TRUE)
	excludes = list(/datum/trait/positive/wall_climber_pro, /datum/trait/positive/wall_climber_natural)

/datum/trait/positive/wall_climber_natural
	name = "Climber, Natural"
	desc = "You can climb certain walls without tools! This is likely due to the unique anatomy of your species. CUSTOM AND XENOCHIM ONLY"
	tutorial = "You must approach a wall and right click it and select the \
	'climb wall' verb to climb it. You suffer from a movement delay of 1.5 with this trait.\n \
	Your total climb time is expected to be 17.5 seconds. Tools may reduce this. \n\n \
	This likewise allows descending walls, provided you're facing an empty space and standing on \
	a climbable wall. To climbe like so, use the verb 'Climb Down Wall' in IC tab!"
	cost = 0
	custom_only = FALSE
	var_changes = list("can_climb" = TRUE)
	allowed_species = list(SPECIES_XENOCHIMERA, SPECIES_CUSTOM)	//So that we avoid needless bloat for xenochim
	excludes = list(/datum/trait/positive/wall_climber_pro, /datum/trait/positive/wall_climber)

/datum/trait/positive/wall_climber_pro
	name = "Climber, Professional"
	desc = "You can climb certain walls without tools! You are a professional rock climber at this, letting you climb almost twice as fast!"
	tutorial = "You must approach a wall and right click it and select the \
	'climb wall' verb to climb it. Your movement delay is just 1.25 with this trait.\n \
	Your climb time is expected to be 9 seconds. Tools may reduce this. \n\n \
	This likewise allows descending walls, provided you're facing an empty space and standing on \
	a climbable wall. To climbe like so, use the verb 'Climb Down Wall' in IC tab!"
	cost = 2
	custom_only = FALSE
	var_changes = list("climbing_delay" = 1.25)
	varchange_type = TRAIT_VARCHANGE_LESS_BETTER
	excludes = list(/datum/trait/positive/wall_climber,/datum/trait/positive/wall_climber_natural)

// This feels jank, but it's the cleanest way I could do TRAIT_VARCHANGE_LESS_BETTER while having a boolean var change
// Alternate would've been banned_species = list(SPECIES_TAJ, SPECIES_VASSILISIAN)
// Opted for this as it's "future proof"
/datum/trait/positive/wall_climber_pro/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	S.can_climb = TRUE

//RS ADD START
/datum/trait/positive/blend_in
	name = "Chameleon Blend In"
	desc = "Allows one to blend in to their environment while immobile, becoming very difficult to see!"
	cost = 1
	custom_only = TRUE

/datum/trait/positive/blend_in/apply(var/datum/species/S,var/mob/living/carbon/human/H)
	..()
	H.verbs |= /mob/living/proc/chameleon_blend

/datum/trait/positive/tracker
	name = "Olfactory Tracker"
	desc = "Your nose is sensitive enough to track smells!"
	cost = 1
	custom_only = FALSE

/datum/trait/positive/tracker/apply(datum/species/S, mob/living/carbon/human/H, trait_prefs)
	. = ..()

	H.olfaction_track = TRUE
	H.verbs |= /mob/living/proc/track_target

//RS ADD END
