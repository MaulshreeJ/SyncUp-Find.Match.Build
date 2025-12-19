import asyncHandler from "express-async-handler";
import HackathonRegistration from "../models/HackathonRegistration.js";
import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";
import User from "../models/User.js";

/**
 * @desc    Register for a hackathon as solo participant
 * @route   POST /api/hackathons/:hackathonId/register
 * @access  Private
 */
export const registerForHackathon = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user._id;

  // Check if hackathon exists
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  // Check if already registered
  let registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (registration) {
    return res.status(200).json({
      message: "Already registered",
      registration,
    });
  }

  // Create new registration as solo
  registration = await HackathonRegistration.create({
    user: userId,
    hackathon: hackathonId,
    role: "solo",
    teamId: null,
  });

  await registration.populate("user", "name email avatar");
  await registration.populate("hackathon", "name date");

  res.status(201).json({
    message: "Successfully registered for hackathon",
    registration,
  });
});

/**
 * @desc    Create a team for a hackathon
 * @route   POST /api/hackathons/:hackathonId/team/create
 * @access  Private
 */
export const createTeam = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const { teamName, maxMembers } = req.body;
  const userId = req.user._id;

  if (!teamName || teamName.trim() === "") {
    res.status(400);
    throw new Error("Team name is required");
  }

  // Check if user is registered
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration) {
    res.status(400);
    throw new Error("You must register for the hackathon first");
  }

  // User must be solo to create a team
  if (registration.role !== "solo") {
    res.status(400);
    throw new Error("You are already in a team. Leave your current team first.");
  }

  // Create the team
  const team = await Team.create({
    name: teamName.trim(),
    hackathon: hackathonId,
    leader: userId,
    members: [userId],
    maxMembers: maxMembers || 5,
  });

  // Update registration
  registration.role = "leader";
  registration.teamId = team._id;
  await registration.save();

  await team.populate("leader", "name email avatar");
  await team.populate("members", "name email avatar skills");

  res.status(201).json({
    message: "Team created successfully",
    team,
  });
});

/**
 * @desc    Join a team using invite code
 * @route   POST /api/hackathons/:hackathonId/team/join
 * @access  Private
 */
export const joinTeam = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const { inviteCode, teamId } = req.body;
  const userId = req.user._id;

  // Check if user is registered
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration) {
    res.status(400);
    throw new Error("You must register for the hackathon first");
  }

  // User must be solo to join a team
  if (registration.role !== "solo") {
    res.status(400);
    throw new Error("You are already in a team. Leave your current team first.");
  }

  // Find team by invite code or teamId
  let team;
  if (inviteCode) {
    team = await Team.findOne({ inviteCode, hackathon: hackathonId });
  } else if (teamId) {
    team = await Team.findOne({ _id: teamId, hackathon: hackathonId });
  } else {
    res.status(400);
    throw new Error("Provide either inviteCode or teamId");
  }

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    res.status(400);
    throw new Error("Team is full");
  }

  // Check if user is already in the team
  if (team.members.includes(userId)) {
    res.status(400);
    throw new Error("You are already in this team");
  }

  // Add user to team
  team.members.push(userId);
  await team.save();

  // Update registration
  registration.role = "member";
  registration.teamId = team._id;
  await registration.save();

  await team.populate("leader", "name email avatar");
  await team.populate("members", "name email avatar skills");

  res.status(200).json({
    message: "Successfully joined team",
    team,
  });
});

/**
 * @desc    Leave a team
 * @route   POST /api/hackathons/:hackathonId/team/leave
 * @access  Private
 */
export const leaveTeam = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user._id;

  // Check if user is registered
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration || !registration.teamId) {
    res.status(400);
    throw new Error("You are not in a team");
  }

  // Leaders cannot leave - they must transfer leadership or delete team
  if (registration.role === "leader") {
    res.status(400);
    throw new Error(
      "As a leader, you must transfer leadership or delete the team before leaving"
    );
  }

  // Find the team
  const team = await Team.findById(registration.teamId);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Remove user from team members
  team.members = team.members.filter(
    (memberId) => memberId.toString() !== userId.toString()
  );
  await team.save();

  // Update registration to solo
  registration.role = "solo";
  registration.teamId = null;
  await registration.save();

  res.status(200).json({
    message: "Successfully left the team",
  });
});

/**
 * @desc    Remove a member from team (leader only)
 * @route   POST /api/hackathons/:hackathonId/team/remove-member
 * @access  Private
 */
export const removeMember = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const { memberId } = req.body;
  const userId = req.user._id;

  if (!memberId) {
    res.status(400);
    throw new Error("Member ID is required");
  }

  // Check if user is the leader
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration || registration.role !== "leader") {
    res.status(403);
    throw new Error("Only team leader can remove members");
  }

  const team = await Team.findById(registration.teamId);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Cannot remove yourself
  if (memberId === userId.toString()) {
    res.status(400);
    throw new Error("You cannot remove yourself. Use delete team or transfer leadership.");
  }

  // Check if member is in the team
  if (!team.members.some((m) => m.toString() === memberId)) {
    res.status(400);
    throw new Error("User is not in your team");
  }

  // Remove member from team
  team.members = team.members.filter((m) => m.toString() !== memberId);
  await team.save();

  // Update member's registration
  const memberRegistration = await HackathonRegistration.findOne({
    user: memberId,
    hackathon: hackathonId,
  });

  if (memberRegistration) {
    memberRegistration.role = "solo";
    memberRegistration.teamId = null;
    await memberRegistration.save();
  }

  await team.populate("leader", "name email avatar");
  await team.populate("members", "name email avatar skills");

  res.status(200).json({
    message: "Member removed successfully",
    team,
  });
});

/**
 * @desc    Transfer team leadership
 * @route   POST /api/hackathons/:hackathonId/team/transfer-leadership
 * @access  Private
 */
export const transferLeadership = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const { newLeaderId } = req.body;
  const userId = req.user._id;

  if (!newLeaderId) {
    res.status(400);
    throw new Error("New leader ID is required");
  }

  // Check if user is the leader
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration || registration.role !== "leader") {
    res.status(403);
    throw new Error("Only team leader can transfer leadership");
  }

  const team = await Team.findById(registration.teamId);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if new leader is a member
  if (!team.members.some((m) => m.toString() === newLeaderId)) {
    res.status(400);
    throw new Error("New leader must be a member of the team");
  }

  // Find new leader's registration
  const newLeaderRegistration = await HackathonRegistration.findOne({
    user: newLeaderId,
    hackathon: hackathonId,
  });

  if (!newLeaderRegistration) {
    res.status(400);
    throw new Error("New leader is not registered for this hackathon");
  }

  // Update team leader
  team.leader = newLeaderId;
  await team.save();

  // Update registrations
  registration.role = "member";
  await registration.save();

  newLeaderRegistration.role = "leader";
  await newLeaderRegistration.save();

  await team.populate("leader", "name email avatar");
  await team.populate("members", "name email avatar skills");

  res.status(200).json({
    message: "Leadership transferred successfully",
    team,
  });
});

/**
 * @desc    Delete team (leader only)
 * @route   DELETE /api/hackathons/:hackathonId/team/delete
 * @access  Private
 */
export const deleteTeam = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user._id;

  // Check if user is the leader
  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  });

  if (!registration || registration.role !== "leader") {
    res.status(403);
    throw new Error("Only team leader can delete the team");
  }

  const team = await Team.findById(registration.teamId);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Get all team members
  const memberIds = team.members;

  // Update all members' registrations to solo
  await HackathonRegistration.updateMany(
    {
      hackathon: hackathonId,
      teamId: team._id,
    },
    {
      $set: {
        role: "solo",
        teamId: null,
      },
    }
  );

  // Delete the team
  await Team.findByIdAndDelete(team._id);

  res.status(200).json({
    message: "Team deleted successfully. All members are now solo participants.",
  });
});

/**
 * @desc    Get user's registration status for a hackathon
 * @route   GET /api/hackathons/:hackathonId/my-registration
 * @access  Private
 */
export const getMyRegistration = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;
  const userId = req.user._id;

  const registration = await HackathonRegistration.findOne({
    user: userId,
    hackathon: hackathonId,
  })
    .populate("user", "name email avatar skills")
    .populate("hackathon", "name date endDate location")
    .populate({
      path: "teamId",
      populate: [
        { path: "leader", select: "name email avatar" },
        { path: "members", select: "name email avatar skills" },
      ],
    });

  if (!registration) {
    return res.status(404).json({
      message: "Not registered for this hackathon",
    });
  }

  res.status(200).json(registration);
});

/**
 * @desc    Get all teams for a hackathon
 * @route   GET /api/hackathons/:hackathonId/teams
 * @access  Public
 */
export const getHackathonTeams = asyncHandler(async (req, res) => {
  const { hackathonId } = req.params;

  const teams = await Team.find({ hackathon: hackathonId })
    .populate("leader", "name email avatar")
    .populate("members", "name email avatar skills")
    .sort({ createdAt: -1 });

  res.status(200).json({
    count: teams.length,
    teams,
  });
});

/**
 * @desc    Get team by ID
 * @route   GET /api/hackathons/:hackathonId/team/:teamId
 * @access  Public
 */
export const getTeamById = asyncHandler(async (req, res) => {
  const { hackathonId, teamId } = req.params;

  const team = await Team.findOne({ _id: teamId, hackathon: hackathonId })
    .populate("leader", "name email avatar skills")
    .populate("members", "name email avatar skills");

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  res.status(200).json(team);
});
