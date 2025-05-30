/datum/species/shadekin
	name = SPECIES_SHADEKIN
	name_plural = "Shadekin"
	icobase = 'icons/mob/human_races/r_shadekin_vr.dmi'
	deform = 'icons/mob/human_races/r_shadekin_vr.dmi'
	tail = "tail"
	icobase_tail = 1
	blurb = "Very little is known about these creatures. They appear to be largely mammalian in appearance. \
	Seemingly very rare to encounter, there have been widespread myths of these creatures the galaxy over, \
	but next to no verifiable evidence to their existence. However, they have recently been more verifiably \
	documented in the Virgo system, following a mining bombardment of Virgo 3. The crew of NSB Adephagia have \
	taken to calling these creatures 'Shadekin', and the name has generally stuck and spread. "		//TODO: Something that's not wiki copypaste
	wikilink = "https://wiki.vore-station.net/Shadekin"
	catalogue_data = list(/datum/category_item/catalogue/fauna/shadekin)

	language = LANGUAGE_SHADEKIN
	name_language = LANGUAGE_SHADEKIN
	species_language = LANGUAGE_SHADEKIN
	secondary_langs = list(LANGUAGE_SHADEKIN)
	num_alternate_languages = 3
	unarmed_types = list(/datum/unarmed_attack/stomp, /datum/unarmed_attack/kick, /datum/unarmed_attack/claws/shadekin, /datum/unarmed_attack/bite/sharp/shadekin)
	rarity_value = 15	//INTERDIMENSIONAL FLUFFERS

	inherent_verbs = list(/mob/proc/adjust_hive_range, /mob/living/carbon/human/proc/adjust_flicker) //RS Edit

	siemens_coefficient = 1
	darksight = 10

	slowdown = -0.5
	item_slowdown_mod = 0.5

	brute_mod = 0.7	// Naturally sturdy.
	burn_mod = 1.2	// Furry

	warning_low_pressure = 50
	hazard_low_pressure = -1

	warning_high_pressure = 300
	hazard_high_pressure = INFINITY

	cold_level_1 = -1	//Immune to cold
	cold_level_2 = -1
	cold_level_3 = -1

	heat_level_1 = 850	//Resistant to heat
	heat_level_2 = 1000
	heat_level_3 = 1150

	flags =  NO_SCAN | NO_MINOR_CUT | NO_INFECT
	spawn_flags = SPECIES_CAN_JOIN | SPECIES_IS_WHITELISTED | SPECIES_WHITELIST_SELECTABLE

	reagent_tag = IS_SHADEKIN		// for shadekin-unqiue chem interactions

	flesh_color = "#FFC896"
	blood_color = "#A10808"
	base_color = "#f0f0f0"
	color_mult = 1

	// has_glowing_eyes = TRUE			//Applicable through neutral taits.

	death_message = "phases to somewhere far away!"
	male_cough_sounds = null
	female_cough_sounds = null
	male_sneeze_sound = null
	female_sneeze_sound = null

	speech_bubble_appearance = "ghost"

	genders = list(MALE, FEMALE, PLURAL, NEUTER)

	virus_immune = 1

	breath_type = null
	poison_type = null
	water_breather = TRUE	//They don't quite breathe

//	vision_flags = SEE_SELF|SEE_MOBS	//RS REMOVE
	appearance_flags = HAS_HAIR_COLOR | HAS_LIPS | HAS_SKIN_COLOR | HAS_EYE_COLOR | HAS_UNDERWEAR
	digi_allowed = TRUE

	move_trail = /obj/effect/decal/cleanable/blood/tracks/paw

	has_organ = list(
		O_HEART =		/obj/item/organ/internal/heart,
		O_VOICE = 		/obj/item/organ/internal/voicebox,
		O_LIVER =		/obj/item/organ/internal/liver,
		O_KIDNEYS =		/obj/item/organ/internal/kidneys,
		O_BRAIN =		/obj/item/organ/internal/brain/shadekin,
		O_EYES =		/obj/item/organ/internal/eyes,
		O_STOMACH =		/obj/item/organ/internal/stomach,
		O_INTESTINE =	/obj/item/organ/internal/intestine
		)

	has_limbs = list(
		BP_TORSO =  list("path" = /obj/item/organ/external/chest),
		BP_GROIN =  list("path" = /obj/item/organ/external/groin),
		BP_HEAD =   list("path" = /obj/item/organ/external/head/shadekin),
		BP_L_ARM =  list("path" = /obj/item/organ/external/arm),
		BP_R_ARM =  list("path" = /obj/item/organ/external/arm/right),
		BP_L_LEG =  list("path" = /obj/item/organ/external/leg),
		BP_R_LEG =  list("path" = /obj/item/organ/external/leg/right),
		BP_L_HAND = list("path" = /obj/item/organ/external/hand),
		BP_R_HAND = list("path" = /obj/item/organ/external/hand/right),
		BP_L_FOOT = list("path" = /obj/item/organ/external/foot),
		BP_R_FOOT = list("path" = /obj/item/organ/external/foot/right)
		)

	//SHADEKIN-UNIQUE STUFF GOES HERE
	var/list/shadekin_abilities = list(/datum/power/shadekin/phase_shift,
									   /datum/power/shadekin/regenerate_other,
									   /datum/power/shadekin/create_shade,
									   /datum/power/shadekin/phase_flicker) //RS Edit
	var/list/shadekin_ability_datums = list()
	var/kin_type
	var/energy_light = 0.25
	var/energy_dark = 0.75
	var/energy_drain = 0.5	//RS ADD

/datum/species/shadekin/New()
	..()
	for(var/power in shadekin_abilities)
		var/datum/power/shadekin/SKP = new power(src)
		shadekin_ability_datums.Add(SKP)

/datum/species/shadekin/handle_death(var/mob/living/carbon/human/H)
	spawn(1)
		H.release_vore_contents(TRUE)	//RS ADD
		for(var/obj/item/W in H)
			H.drop_from_inventory(W)
		qdel(H)

/datum/species/shadekin/get_bodytype()
	return SPECIES_SHADEKIN

/datum/species/shadekin/get_random_name()
	return "shadekin"

/datum/species/shadekin/handle_environment_special(var/mob/living/carbon/human/H)
	handle_shade(H)

/datum/species/shadekin/add_inherent_verbs(var/mob/living/carbon/human/H)
	..()
	add_shadekin_abilities(H)

/datum/species/shadekin/proc/add_shadekin_abilities(var/mob/living/carbon/human/H)
	if(!H.ability_master || !istype(H.ability_master, /obj/screen/movable/ability_master/shadekin))
		H.ability_master = null
		H.ability_master = new /obj/screen/movable/ability_master/shadekin(H)
	for(var/datum/power/shadekin/P in shadekin_ability_datums)
		if(!(P.verbpath in H.verbs))
			H.verbs += P.verbpath
			H.ability_master.add_shadekin_ability(
					object_given = H,
					verb_given = P.verbpath,
					name_given = P.name,
					ability_icon_given = P.ability_icon_state,
					arguments = list()
					)

/datum/species/shadekin/proc/handle_shade(var/mob/living/carbon/human/H)
	//Shifted kin don't gain/lose energy (and save time if we're at the cap)
	var/darkness = 1
	var/dark_gains = 0

	var/turf/T = get_turf(H)
	if(!T)
		dark_gains = 0
		return

	var/area/A = get_area(H)	//RS ADD START
	if(A.magic_damp)
		set_energy(H,0)
		update_shadekin_hud(H)
		return					//RS ADD END

	var/brightness = T.get_lumcount() //Brightness in 0.0 to 1.0
	darkness = 1-brightness //Invert
	var/is_dark = (darkness >= 0.5)

	if(H.ability_flags & AB_PHASE_SHIFTED)
		dark_gains = 0
	else
		//Heal (very) slowly in good darkness
		if(is_dark)
			H.adjustFireLoss((-0.10)*darkness)
			H.adjustBruteLoss((-0.10)*darkness)
			H.adjustToxLoss((-0.10)*darkness)
			//energy_dark and energy_light are set by the shadekin eye traits.
			//These are balanced around their playstyles and 2 planned new aggressive abilities
			dark_gains = energy_dark
		else
			dark_gains = energy_light

	set_energy(H, get_energy(H) + dark_gains)

	//Update huds
	update_shadekin_hud(H)

/datum/species/shadekin/proc/get_energy(var/mob/living/carbon/human/H)
	var/obj/item/organ/internal/brain/shadekin/shade_organ = H.internal_organs_by_name[O_BRAIN]

	if(!istype(shade_organ))
		return 0
	var/area/A = get_area(H)	//RS ADD START
	if(A.magic_damp)
		return 0				//RS ADD END
	if(shade_organ.dark_energy_infinite)
		return shade_organ.max_dark_energy

	return shade_organ.dark_energy

/datum/species/shadekin/proc/get_max_energy(var/mob/living/carbon/human/H)
	var/obj/item/organ/internal/brain/shadekin/shade_organ = H.internal_organs_by_name[O_BRAIN]

	if(!istype(shade_organ))
		return 0

	return shade_organ.max_dark_energy

/datum/species/shadekin/proc/set_energy(var/mob/living/carbon/human/H, var/new_energy)
	var/obj/item/organ/internal/brain/shadekin/shade_organ = H.internal_organs_by_name[O_BRAIN]

	if(!istype(shade_organ))
		return

	shade_organ.dark_energy = CLAMP(new_energy, 0, get_max_energy(H))

/datum/species/shadekin/proc/set_max_energy(var/mob/living/carbon/human/H, var/new_max_energy)
	var/obj/item/organ/internal/brain/shadekin/shade_organ = H.internal_organs_by_name[O_BRAIN]

	if(!istype(shade_organ))
		return 0

	shade_organ.max_dark_energy = new_max_energy

/datum/species/shadekin/proc/update_shadekin_hud(var/mob/living/carbon/human/H)
	var/turf/T = get_turf(H)
	if(H.shadekin_display)
		var/l_icon = 0
		var/e_icon = 0

		H.shadekin_display.invisibility = 0
		if(T)
			var/brightness = T.get_lumcount() //Brightness in 0.0 to 1.0
			var/darkness = 1-brightness //Invert
			switch(darkness)
				if(0.80 to 1.00)
					l_icon = 0
				if(0.60 to 0.80)
					l_icon = 1
				if(0.40 to 0.60)
					l_icon = 2
				if(0.20 to 0.40)
					l_icon = 3
				if(0.00 to 0.20)
					l_icon = 4

		switch(get_energy(H))
			if(0 to 24)
				e_icon = 0
			if(25 to 49)
				e_icon = 1
			if(50 to 74)
				e_icon = 2
			if(75 to 99)
				e_icon = 3
			if(100 to INFINITY)
				e_icon = 4

		H.shadekin_display.icon_state = "shadekin-[l_icon]-[e_icon]"
	return

/datum/species/shadekin/proc/get_shadekin_eyecolor(var/mob/living/carbon/human/H)
	var/eyecolor_rgb = rgb(H.r_eyes, H.g_eyes, H.b_eyes)

	var/eyecolor_hue = rgb2num(eyecolor_rgb, COLORSPACE_HSV)[1]
	var/eyecolor_sat = rgb2num(eyecolor_rgb, COLORSPACE_HSV)[2]
	var/eyecolor_val = rgb2num(eyecolor_rgb, COLORSPACE_HSV)[3]

	//First, clamp the saturation/value to prevent black/grey/white eyes
	if(eyecolor_sat < 10)
		eyecolor_sat = 10
	if(eyecolor_val < 40)
		eyecolor_val = 40

	eyecolor_rgb = rgb(eyecolor_hue, eyecolor_sat, eyecolor_val, space=COLORSPACE_HSV)

	H.r_eyes = rgb2num(eyecolor_rgb)[1]
	H.g_eyes = rgb2num(eyecolor_rgb)[2]
	H.b_eyes = rgb2num(eyecolor_rgb)[3]

	//Now determine what color we fall into.
	var/eyecolor_type = BLUE_EYES
	switch(eyecolor_hue)
		if(0 to 20)
			eyecolor_type = RED_EYES
		if(21 to 50)
			eyecolor_type = ORANGE_EYES
		if(51 to 70)
			eyecolor_type = YELLOW_EYES
		if(71 to 160)
			eyecolor_type = GREEN_EYES
		if(161 to 260)
			eyecolor_type = BLUE_EYES
		if(261 to 340)
			eyecolor_type = PURPLE_EYES
		if(341 to 360)
			eyecolor_type = RED_EYES

	return eyecolor_type

/datum/species/shadekin/post_spawn_special(var/mob/living/carbon/human/H)
	.=..()

	var/eyecolor_type = get_shadekin_eyecolor(H)
	//RS Edit Start Adjustments for better feeling shadekin.

	//Former(in the dark): BESK: 50 in 200 ||RESK: 50 in 1000 ||PESK: 50 in 100 ||YESK: 50 in 33.3|| GESK: 50 in 50 ||OESK: 50 in 400
	//Current(in the dark): BESK: 50 in 133 ||RESK: 50 in 200 ||PESK: 50 in 100 ||YESK: 50 in 33.3|| GESK: 50 in 50 ||OESK: 50 in 133

	switch(eyecolor_type)
		if(BLUE_EYES)
			total_health = 100
			energy_light = 0.75
			energy_dark = 0.75
		if(RED_EYES)
			total_health = 150		//RS EDIT
			energy_light = 0		//RS EDIT - Don't take their energy while they are trying to grab people
			energy_dark = 0.25		//RS EDIT - Smol energy gain, as they can gain energy in other ways
			energy_drain = 1		//RS ADD
		if(PURPLE_EYES)
			total_health = 115		//RS EDIT
			energy_light = 0.25		//RS EDIT - Part blue, regens in the light
			energy_dark = 0.35		//RS EDIT - Part red, plus part blue, regens a little faster in the dark
			energy_drain = 0.75		//RS ADD
		if(YELLOW_EYES)
			total_health = 100
			energy_light = -2
			energy_dark = 3
		if(GREEN_EYES)
			total_health = 100
			energy_light = 0.125
			energy_dark = 1.5		//RS EDIT	//Make this be half of yellow eyes
		if(ORANGE_EYES)
			total_health = 115		//RS EDIT
			energy_light = 0		//RS EDIT	//Half red, so let's not take their energy away while they hunt
			energy_dark = 1.5		//RS EDIT	//Make this be half of yellow eyes
			energy_drain = 0.75		//RS ADD

	if(H.size_multiplier <= 0.75)
		total_health -= 25
		item_slowdown_mod = 2

	else if(H.size_multiplier >= 1.25)
		total_health += 50
		slowdown = 0
		item_slowdown_mod = 0.5

	//RS Edit End

	H.maxHealth = total_health

	H.health = H.maxHealth

/datum/species/shadekin/produceCopy(var/list/traits, var/mob/living/carbon/human/H, var/custom_base)

	var/datum/species/shadekin/new_copy = ..()

	new_copy.total_health = total_health

	new_copy.energy_light = energy_light

	new_copy.energy_dark = energy_dark

	return new_copy
