
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Hackathon from "../models/Hackathon.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

/**
 * @desc    Create a new hackathon (Admin only)
 * @route   POST /api/hackathons
 * @access  Private/Admin
 */
export const createHackathon = asyncHandler(async (req, res) => {
  const {
    name,
    date,
    endDate,
    location,
    type,
    theme,
    participantsLimit,
    prize,
    difficulty,
    description,
    organizer,
    tags,
  } = req.body;

  const hackathon = new Hackathon({
    name,
    date,
    endDate,
    location,
    type,
    theme,
    participantsLimit,
    prize,
    difficulty,
    description,
    organizer,
    tags,
    participants: [], // array of Team IDs (keeps current contract)
  });

  await hackathon.save();
  res.status(201).json({ message: "Hackathon created successfully", hackathon });
});

/**
 * @desc    Get all hackathons
 * @route   GET /api/hackathons
 * @access  Public
 */
export const getAllHackathons = asyncHandler(async (req, res) => {
  // populate participants (teams) and each team's members
  const hackathons = await Hackathon.find()
    .populate({
      path: "participants",
      populate: { path: "members", select: "name email" },
    })
    .lean();

  res.status(200).json(hackathons);
});

/**
 * @desc    Get single hackathon by ID
 * @route   GET /api/hackathons/:id
 * @access  Public
 */
export const getHackathonById = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id).populate({
    path: "participants",
    populate: { path: "members", select: "name email" },
  });

  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }
  res.status(200).json(hackathon);
});

/**
 * @desc    Join a hackathon (creates or joins a team)
 * @route   POST /api/hackathons/:id/join
 * @access  Private/User
 */
// export const joinHackathon = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   let { teamName } = req.body || {};
//   const hackathon = await Hackathon.findById(req.params.id).populate("participants");

//   if (!hackathon) {
//     res.status(404);
//     throw new Error("Hackathon not found");
//   }

//   // If participantsLimit is set and participants is an array of teams,
//   // interpret participantsLimit as max number of teams.
//   if (hackathon.participantsLimit && hackathon.participants.length >= hackathon.participantsLimit) {
//     res.status(400);
//     throw new Error("Participant (team) limit reached");
//   }

//   // Check if user already in a team for this hackathon
//   const existingTeam = await Team.findOne({
//     hackathon: hackathon._id,
//     members: userId,
//   });
//   if (existingTeam) {
//     res.status(400);
//     throw new Error("You are already part of a team for this hackathon");
//   }

//   // sanitize / default teamName
//   if (!teamName || teamName.toString().trim() === "") {
//     const safeOwnerName = (req.user?.name || "Team").replace(/[^\w\s-]/g, "").trim();
//     const suffix = Date.now().toString().slice(-4);
//     teamName = `${safeOwnerName}-${suffix}`;
//   } else {
//     teamName = teamName.toString().trim();
//   }

//   // Try to find an existing team with same name in this hackathon
//   let team = await Team.findOne({ name: teamName, hackathon: hackathon._id });

//   if (!team) {
//     // Create new team and add the user as first member
//     team = new Team({
//       name: teamName,
//       members: [userId],
//       hackathon: hackathon._id,
//     });
//     await team.save();

//     // add team id to hackathon.participants (keep participants as team refs)
//     hackathon.participants.push(team._id);
//   } else {
//     // Add user to existing team if not already present
//     if (team.members.map(m => m.toString()).includes(userId.toString())) {
//       res.status(400);
//       throw new Error("You are already in this team");
//     }
//     team.members.push(userId);
//     await team.save();
//   }

//   // Save hackathon changes (if any)
//   await hackathon.save();

//   // Populate the returned team with member info
//   const populatedTeam = await Team.findById(team._id).populate("members", "name email");

//   res.status(200).json({
//     message: "Successfully joined hackathon",
//     team: populatedTeam,
//   });
// });





// -------------------------------------------------------------------------------
// export const joinHackathon = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   let { teamName } = req.body || {};
//   const hackathon = await Hackathon.findById(req.params.id).populate("participants");

//   if (!hackathon) {
//     res.status(404);
//     throw new Error("Hackathon not found");
//   }

//   if (hackathon.participantsLimit && hackathon.participants.length >= hackathon.participantsLimit) {
//     res.status(400);
//     throw new Error("Participant (team) limit reached");
//   }

//   // Check existing membership (team members lookup)
//   const existingTeam = await Team.findOne({
//     hackathon: hackathon._id,
//     members: userId,
//   });
//   if (existingTeam) {
//     res.status(400);
//     throw new Error("You are already part of a team for this hackathon");
//   }

//   // sanitize / default teamName
//   if (!teamName || teamName.toString().trim() === "") {
//     const safeOwnerName = (req.user?.name || "Team").replace(/[^\w\s-]/g, "").trim();
//     const suffix = Date.now().toString().slice(-4);
//     teamName = `${safeOwnerName}-${suffix}`;
//   } else {
//     teamName = teamName.toString().trim();
//   }

//   // Try to find an existing team with same name in this hackathon
//   let team = await Team.findOne({ name: teamName, hackathon: hackathon._id });

//   if (!team) {
//     // Create new team and add the user as first member
//     team = new Team({
//       name: teamName,
//       members: [userId],
//       hackathon: hackathon._id,
//     });
//     await team.save();

//     // add team id to hackathon.participants (keep participants as team refs)
//     hackathon.participants.push(team._id);
//   } else {
//     // Add user to existing team if not already present
//     if (team.members.map(m => m.toString()).includes(userId.toString())) {
//       res.status(400);
//       throw new Error("You are already in this team");
//     }
//     team.members.push(userId);
//     await team.save();
//   }

//   // Save hackathon changes (if any)
//   await hackathon.save();

//   // Populate the returned team with member info
//   const populatedTeam = await Team.findById(team._id).populate("members", "name email");

//   // --- Increment user's hackathonsJoined (atomic)
//   const updatedUser = await User.findByIdAndUpdate(
//     userId,
//     { $inc: { hackathonsJoined: 1 } },
//     { new: true, runValidators: true, context: 'query' }
//   ).select("-password");

//   res.status(200).json({
//     message: "Successfully joined hackathon",
//     team: populatedTeam,
//     user: updatedUser
//   });
// });
// -------------------------------------------------------------------------------------------------------

export const joinHackathon = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let { teamName } = req.body || {};
  const hackathon = await Hackathon.findById(req.params.id).populate("participants");

  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  if (hackathon.participantsLimit && hackathon.participants.length >= hackathon.participantsLimit) {
    res.status(400);
    throw new Error("Participant (team) limit reached");
  }

  // Check existing membership (team members lookup)
  const existingTeam = await Team.findOne({
    hackathon: hackathon._id,
    members: userId,
  });
  if (existingTeam) {
    res.status(400);
    throw new Error("You are already part of a team for this hackathon");
  }

  // sanitize / default teamName
  if (!teamName || teamName.toString().trim() === "") {
    const safeOwnerName = (req.user?.name || "Team").replace(/[^\w\s-]/g, "").trim();
    const suffix = Date.now().toString().slice(-4);
    teamName = `${safeOwnerName}-${suffix}`;
  } else {
    teamName = teamName.toString().trim();
  }

  // Try to find an existing team with same name in this hackathon
  let team = await Team.findOne({ name: teamName, hackathon: hackathon._id });

  if (!team) {
    // Create new team and add the user as first member
    team = new Team({
      name: teamName,
      members: [userId],
      hackathon: hackathon._id,
    });
    await team.save();

    // add team id to hackathon.participants (keep participants as team refs)
    hackathon.participants.push(team._id);
  } else {
    // Add user to existing team if not already present
    if (team.members.map(m => m.toString()).includes(userId.toString())) {
      res.status(400);
      throw new Error("You are already in this team");
    }
    team.members.push(userId);
    await team.save();
  }

  // Save hackathon changes (if any)
  await hackathon.save();

  // Populate the returned team with member info
  const populatedTeam = await Team.findById(team._id).populate("members", "name email");

  // --- Update user's hackathon references and increment counter atomically only when not already present
  // This update will only match (and therefore only $inc) if hackathon._id is not already in the array.
  await User.updateOne(
    { _id: userId, hackathons: { $ne: hackathon._id } }, // match only if not already present
    {
      $addToSet: { hackathons: hackathon._id }, // push if not present
      $inc: { hackathonsJoined: 1 }, // increment only when added
    }
  );

  // fetch the latest user (without password) to return to client
  const updatedUser = await User.findById(userId).select("-password");

  res.status(200).json({
    message: "Successfully joined hackathon",
    team: populatedTeam,
    user: updatedUser,
  });
});


/**
 * @desc    Get participants (teams + users) for a hackathon (Admin only)
 * @route   GET /api/hackathons/:id/participants
 * @access  Private/Admin
 */
export const getHackathonParticipants = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id).populate({
    path: "participants",
    populate: { path: "members", select: "name email" },
  });

  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  // prepare a response structure that is convenient for admin UI
  const teams = (hackathon.participants || []).map((team) => ({
    _id: team._id,
    name: team.name,
    members: (team.members || []).map((m) => ({ _id: m._id, name: m.name, email: m.email })),
    memberCount: Array.isArray(team.members) ? team.members.length : 0,
  }));

  res.status(200).json({
    hackathon: {
      _id: hackathon._id,
      name: hackathon.name,
      date: hackathon.date,
      endDate: hackathon.endDate,
      participantsLimit: hackathon.participantsLimit,
    },
    teams,
    totalTeams: teams.length,
    totalParticipants: teams.reduce((sum, t) => sum + t.memberCount, 0),
  });
});

