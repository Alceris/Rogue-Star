// This is specifically for slimes since we don't have a 'normal' processor now.
// Feel free to rename it if that ever changes.

/obj/machinery/processor
	name = "slime processor"
	desc = "An industrial grinder used to automate the process of slime core extraction.  It can also recycle biomatter."
	icon = 'icons/obj/kitchen.dmi'
	icon_state = "processor1"
	density = TRUE
	anchored = TRUE
	var/processing = FALSE // So I heard you like processing.
	var/list/to_be_processed = list()
	var/list/monkeys_recycled = list()	//RS EDIT
	description_info = "Clickdrag dead slimes or monkeys to it to insert them.  It will make a new monkey cube for every four monkeys it processes."

/obj/item/weapon/circuitboard/processor
	name = T_BOARD("slime processor")
	build_path = /obj/machinery/processor
	origin_tech = list(TECH_DATA = 2, TECH_BIO = 2)

/obj/machinery/processor/attack_hand(mob/living/user)
	if(processing)
		to_chat(user, "<span class='warning'>The processor is in the process of processing!</span>")
		return
	if(to_be_processed.len)
		spawn(1)
			begin_processing()
	else
		to_chat(user, "<span class='warning'>The processor is empty.</span>")
		playsound(src, 'sound/machines/buzz-sigh.ogg', 50, 1)
		return

// Verb to remove everything.
/obj/machinery/processor/verb/eject()
	set category = "Object"
	set name = "Eject Processor"
	set src in oview(1)

	if(usr.stat || !usr.canmove || usr.restrained())
		return
	empty()
	add_fingerprint(usr)
	return

// Ejects all the things out of the machine.
/obj/machinery/processor/proc/empty()
	for(var/atom/movable/AM in to_be_processed)
		to_be_processed.Remove(AM)
		AM.forceMove(get_turf(src))

// Ejects all the things out of the machine.
/obj/machinery/processor/proc/insert(var/atom/movable/AM, var/mob/living/user)
	if(!Adjacent(AM))
		return
	if(!can_insert(AM))
		to_chat(user, "<span class='warning'>\The [src] cannot process \the [AM] at this time.</span>")
		playsound(src, 'sound/machines/buzz-sigh.ogg', 50, 1)
		return
	to_be_processed.Add(AM)
	AM.forceMove(src)
	visible_message("<b>\The [user]</b> places [AM] inside \the [src].")

/obj/machinery/processor/proc/begin_processing()
	if(processing)
		return // Already doing it.
	processing = TRUE
	playsound(src, 'sound/machines/juicer.ogg', 50, 1)
	for(var/atom/movable/AM in to_be_processed)
		extract(AM)
		sleep(1 SECONDS)

	while(monkeys_recycled.len >= 4)	//RS EDIT START - Let's think about what KIND of monkeys we got instead of just giving regular monkeys
		var/which = pick(monkeys_recycled)
		juice_monkey(src,monkeys_recycled[which])
		monkeys_recycled.Remove(which)	//Remove the one we picked
		monkeys_recycled.Remove(pick(monkeys_recycled))	//Also remove 3 more since we're mashing them together.
		monkeys_recycled.Remove(pick(monkeys_recycled))
		monkeys_recycled.Remove(pick(monkeys_recycled))	//RS EDIT END
		playsound(src, 'sound/effects/splat.ogg', 50, 1)
		sleep(1 SECOND)

	processing = FALSE
	playsound(src, 'sound/machines/ding.ogg', 50, 1)

/obj/machinery/processor/proc/extract(var/atom/movable/AM)
	if(istype(AM, /mob/living/simple_mob/slime))
		var/mob/living/simple_mob/slime/S = AM
		while(S.cores)
			new S.coretype(get_turf(src))
			playsound(src, 'sound/effects/splat.ogg', 50, 1)
			S.cores--
			sleep(1 SECOND)
		to_be_processed.Remove(S)
		qdel(S)

	if(istype(AM, /mob/living/carbon/human))
		var/mob/living/carbon/human/M = AM
		playsound(src, 'sound/effects/splat.ogg', 50, 1)
		to_be_processed.Remove(M)
		monkeys_recycled["[world.time]-[M.species.name]"] = M.species.name	//RS EDIT
		qdel(M)
		sleep(1 SECOND)

/obj/machinery/processor/proc/can_insert(var/atom/movable/AM)
	if(istype(AM, /mob/living/simple_mob/slime))
		var/mob/living/simple_mob/slime/S = AM
		if(S.stat != DEAD)
			return FALSE
		return TRUE
	if(istype(AM, /mob/living/carbon/human))
		var/mob/living/carbon/human/H = AM
		if(!istype(H.species, /datum/species/monkey))
			return FALSE
		if(H.stat != DEAD)
			return FALSE
		return TRUE
	return FALSE

/obj/machinery/processor/MouseDrop_T(var/atom/movable/AM, var/mob/living/user)
	if(user.stat || user.incapacitated(INCAPACITATION_DISABLED) || !istype(user))
		return
	insert(AM, user)

/proc/juice_monkey(var/where,var/input)	//RS ADD START - Since we need this in multiple places, let's just make it a global proc lol
	if(!where || !input)
		return
	var/which
	switch(input)
		if(SPECIES_MONKEY_TAJ)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/farwacube
		if(SPECIES_MONKEY_SKRELL)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/neaeracube
		if(SPECIES_MONKEY_UNATHI)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/stokcube
		if(SPECIES_MONKEY_AKULA)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/sobakacube
		if(SPECIES_MONKEY_NEVREAN)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/sparracube
		if(SPECIES_MONKEY_SERGAL)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/sarucube
		if(SPECIES_MONKEY_VULPKANIN)
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube/wolpincube
		else
			which = /obj/item/weapon/reagent_containers/food/snacks/monkeycube
	if(which)
		new which(get_turf(where))

//RS ADD END
