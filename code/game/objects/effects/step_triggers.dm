/* Simple object type, calls a proc when "stepped" on by something */

/obj/effect/step_trigger
	var/affect_ghosts = 0
	var/stopper = 1 // stops throwers
	invisibility = 99 // nope cant see this shit
	plane = ABOVE_PLANE
	anchored = TRUE
	icon = 'icons/mob/screen1.dmi' //VS Edit
	icon_state = "centermarker" //VS Edit

/obj/effect/step_trigger/proc/Trigger(var/atom/movable/A)
	return 0

/obj/effect/step_trigger/Crossed(atom/movable/H as mob|obj)
	if(H.is_incorporeal())
		return
	..()
	if(!H)
		return
	if(istype(H, /mob/observer) && !affect_ghosts)
		return
	Trigger(H)



/* Tosses things in a certain direction */

/obj/effect/step_trigger/thrower
	var/direction = SOUTH // the direction of throw
	var/tiles = 3	// if 0: forever until atom hits a stopper
	var/immobilize = 1 // if nonzero: prevents mobs from moving while they're being flung
	var/speed = 1	// delay of movement
	var/facedir = 0 // if 1: atom faces the direction of movement
	var/nostop = 0 // if 1: will only be stopped by teleporters
	var/list/affecting = list()

/obj/effect/step_trigger/thrower/Trigger(var/atom/A)
	if(!A || !istype(A, /atom/movable))
		return
	var/atom/movable/AM = A
	var/curtiles = 0
	var/stopthrow = 0
	for(var/obj/effect/step_trigger/thrower/T in orange(2, src))
		if(AM in T.affecting)
			return

	if(ismob(AM))
		var/mob/M = AM
		if(immobilize)
			M.canmove = 0

	affecting.Add(AM)
	while(AM && !stopthrow)
		if(tiles)
			if(curtiles >= tiles)
				break
		if(AM.z != src.z)
			break

		curtiles++

		sleep(speed)

		// Calculate if we should stop the process
		if(!nostop)
			for(var/obj/effect/step_trigger/T in get_step(AM, direction))
				if(T.stopper && T != src)
					stopthrow = 1
		else
			for(var/obj/effect/step_trigger/teleporter/T in get_step(AM, direction))
				if(T.stopper)
					stopthrow = 1

		if(AM)
			var/predir = AM.dir
			step(AM, direction)
			if(!facedir)
				AM.set_dir(predir)



	affecting.Remove(AM)

	if(ismob(AM))
		var/mob/M = AM
		if(immobilize)
			M.canmove = 1

/* Stops things thrown by a thrower, doesn't do anything */

/obj/effect/step_trigger/stopper

/* Instant teleporter */

/obj/effect/step_trigger/teleporter
	var/teleport_x = 0	// teleportation coordinates (if one is null, then no teleport!)
	var/teleport_y = 0
	var/teleport_z = 0

/obj/effect/step_trigger/teleporter/Initialize()
	. = ..()
	if(!teleport_z)	//RS ADD - If we don't have a Z then let's use the Z the thing is on!
		teleport_z = z			//RS ADD

/obj/effect/step_trigger/teleporter/Trigger(atom/movable/AM)
	if(teleport_x && teleport_y && teleport_z)
		var/turf/T = locate(teleport_x, teleport_y, teleport_z)
		move_object(AM, T)

/obj/effect/step_trigger/teleporter/proc/move_object(atom/movable/AM, turf/T)
	if(!T)
		return
	if(AM.anchored && !istype(AM, /obj/mecha))
		return
	if(istype(AM,/obj/effect/abstract/directional_lighting))	//RS EDIT - Don't teleport flashlight spotlights
		return	//RS EDIT
	if(isliving(AM))
		var/mob/living/L = AM
		if(L.pulling)
			var/atom/movable/P = L.pulling
			L.stop_pulling()
			P.forceMove(T)
			L.forceMove(T)
			L.start_pulling(P)
		else
			L.forceMove(T)
	else
		AM.forceMove(T)

/* Moves things by an offset, useful for 'Bridges'. Uses dir and a distance var to work with maploader direction changes. */
/obj/effect/step_trigger/teleporter/offset
	icon = 'icons/effects/effects.dmi'
	icon_state = "arrow"
	var/distance = 3

/obj/effect/step_trigger/teleporter/offset/north
	dir = NORTH

/obj/effect/step_trigger/teleporter/offset/south
	dir = SOUTH

/obj/effect/step_trigger/teleporter/offset/east
	dir = EAST

/obj/effect/step_trigger/teleporter/offset/west
	dir = WEST

/obj/effect/step_trigger/teleporter/offset/Trigger(atom/movable/AM)
	var/turf/T = get_turf(src)
	for(var/i = 1 to distance)
		T = get_step(T, dir)
		if(!istype(T))
			return
	move_object(AM, T)



/* Random teleporter, teleports atoms to locations ranging from teleport_x - teleport_x_offset, etc */

/obj/effect/step_trigger/teleporter/random
	var/teleport_x_offset = 0
	var/teleport_y_offset = 0
	var/teleport_z_offset = 0

/obj/effect/step_trigger/teleporter/random/Trigger(var/atom/movable/A)
	if(teleport_x && teleport_y && teleport_z)
		if(teleport_x_offset && teleport_y_offset && teleport_z_offset)
			var/turf/T = locate(rand(teleport_x, teleport_x_offset), rand(teleport_y, teleport_y_offset), rand(teleport_z, teleport_z_offset))
			if(T)
				A.forceMove(T)

/* Teleporter that sends objects stepping on it to a specific landmark. */

/obj/effect/step_trigger/teleporter/landmark
	var/obj/effect/landmark/the_landmark = null
	var/landmark_id = null

/obj/effect/step_trigger/teleporter/landmark/Initialize()
	. = ..()
	for(var/obj/effect/landmark/teleport_mark/mark in tele_landmarks)
		if(mark.landmark_id == landmark_id)
			the_landmark = mark
			return

/obj/effect/step_trigger/teleporter/landmark/Trigger(var/atom/movable/A)
	if(the_landmark)
		A.forceMove(get_turf(the_landmark))


var/global/list/tele_landmarks = list() // Terrible, but the alternative is looping through world.

/obj/effect/landmark/teleport_mark
	var/landmark_id = null

/obj/effect/landmark/teleport_mark/New()
	..()
	tele_landmarks += src

/obj/effect/landmark/teleport_mark/Destroy()
	tele_landmarks -= src
	return ..()

/* Teleporter which simulates falling out of the sky. */

/obj/effect/step_trigger/teleporter/planetary_fall
	var/datum/planet/planet = null

// First time setup, which planet are we aiming for?
/obj/effect/step_trigger/teleporter/planetary_fall/proc/find_planet()
	return

/obj/effect/step_trigger/teleporter/planetary_fall/Trigger(var/atom/movable/A)
	if(!planet)
		find_planet()

	if(planet)
		if(!planet.planet_floors.len)
			message_admins("ERROR: planetary_fall step trigger's list of outdoor floors was empty.")
			return
		var/turf/simulated/T = null
		var/safety = 100 // Infinite loop protection.
		while(!T && safety)
			var/turf/simulated/candidate = pick(planet.planet_floors)
			if(!istype(candidate) || istype(candidate, /turf/simulated/sky))
				safety--
				continue
			else if(candidate && !candidate.is_outdoors())
				safety--
				continue
			else
				T = candidate
				break

		if(!T)
			message_admins("ERROR: planetary_fall step trigger could not find a suitable landing turf.")
			return

		if(isobserver(A))
			A.forceMove(T) // Harmlessly move ghosts.
			return
		//VOREStation Edit Start
		if(!(A.can_fall()))
			return // Phased shifted kin should not fall
		//VOREStation Edit End

		A.forceMove(T)
		// Living things should probably be logged when they fall...
		if(isliving(A))
			message_admins("\The [A] fell out of the sky.")
		// ... because they're probably going to die from it.
		A.fall_impact(T, 42, 90, FALSE, TRUE)	//You will not be defibbed from this.
	else
		message_admins("ERROR: planetary_fall step trigger lacks a planet to fall onto.")
		return

//Death

/obj/effect/step_trigger/death
	var/deathmessage = "You die a horrible, brutal and very sudden death."
	var/deathalert = "has stepped on a death trigger."

/obj/effect/step_trigger/death/Trigger(var/atom/movable/A)
	if(isliving(A))
		to_chat(A, "<span class='danger'>[deathmessage]</span>")
		log_and_message_admins("[A] [deathalert]")
		qdel(A)

/obj/effect/step_trigger/death/train_lost
	deathmessage = "You fly down the tunnel of the train at high speed for a few moments before impact kills you with sheer concussive force."
	deathalert = "fell off the side of the train and died horribly."

/obj/effect/step_trigger/death/train_crush
	deathmessage = "You get horribly crushed by the train, there's pretty much nothing left of you."
	deathalert = "fell under the train and was crushed horribly."

/obj/effect/step_trigger/death/fly_off
	deathmessage = "You get caught up in the slipstream of the train and quickly dragged down into the tracks. Your body is brutally smashed into the electrified rails and then sucked right under a carriage. No one is finding that mess, thankfully."
	deathalert = "tried to fly away from the train but was died horribly in the process."

//warning

/obj/effect/step_trigger/warning
	var/warningmessage = "Warning!"
	icon_state = "warnmarker"

/obj/effect/step_trigger/warning/Trigger(var/atom/movable/A)
	if(isliving(A))
		to_chat(A, "<span class='warning'>[warningmessage]</span>")

/obj/effect/step_trigger/warning/train_edge
	warningmessage = "The wind billowing alongside the train is extremely strong here! Any movement could easily pull you down beneath the carriages, return to the train immediately!"
