import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Hackathon from "../models/Hackathon.js";

/**
 * @desc    Join hackathon as team leader
 * @route   POST /api/team/join
 * @access  Private
 */
export const joinHackathonAsLeader = asyncHandler(async (req, res) => {
  const { hackathonId, teamName, projectName } = req.body;
  const userId = req.user._id;

  console.log("Join hackathon as leader:", { 
    userId, 
    hackathonId, 
    teamName: `"${teamName}"`, 
    projectName: `"${projectName}"`,
    teamNameType: typeof teamName,
    hackathonIdType: typeof hackathonId
  });

  // Validate required fields
  if (!hackathonId || !teamName) {
    res.status(400);
    throw new Error("Hackathon ID and team name are required");
  }

  // Check if hackathon exists
  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    res.status(404);
    throw new Error("Hackathon not found");
  }

  console.log(" Found hackathon:", { id: hackathon._id, name: hackathon.name, type: typeof hackathon._id });

  // Get current user
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if user is already part of this specific hackathon
  const existingEntry = (user.hackathonsJoined || []).find(
    entry => entry.hackathonId && entry.hackathonId.toString() === hackathonId
  );

  if (existingEntry) {
    res.status(400);
    throw new Error("You are already part of a team for this hackathon");
  }

  // Validate that we have all required data
  const trimmedTeamName = teamName?.trim();
  if (!trimmedTeamName) {
    res.status(400);
    throw new Error("Team name cannot be empty");
  }

  if (!hackathon.name) {
    res.status(400);
    throw new Error("Hackathon name is missing");
  }

  // Create new hackathon entry
  const newHackathonEntry = {
    hackathonId: hackathon._id, // Keep as is, mongoose will handle ObjectId conversion
    hackathonName: hackathon.name,
    teamName: trimmedTeamName,
    projectName: projectName?.trim() || "",
    isTeamLeader: true,
    teamLeaderEmail: req.user.email,
    joinedAt: new Date(),
    teamMembers: [] // Start with empty team
  };

  console.log("📝 Creating hackathon entry:", {
    ...newHackathonEntry,
    hackathonId: newHackathonEntry.hackathonId.toString()
  });

  console.log("📋 User before save:", {
    email: user.email,
    hackathonsJoinedLength: user.hackathonsJoined?.length || 0,
    hackathonsJoinedExists: !!user.hackathonsJoined,
    existingHackathons: user.hackathonsJoined?.map(h => ({
      id: h.hackathonId?.toString(),
      name: h.hackathonName,
      team: h.teamName
    })) || []
  });

  // Initialize hackathonsJoined array if it doesn't exist
  if (!user.hackathonsJoined) {
    user.hackathonsJoined = [];
  }

  // Clean up any malformed entries (missing required fields)
  const originalLength = user.hackathonsJoined.length;
  user.hackathonsJoined = user.hackathonsJoined.filter(entry => 
    entry.hackathonId && entry.hackathonName && entry.teamName
  );
  
  if (user.hackathonsJoined.length < originalLength) {
    console.log(`🧹 Cleaned up ${originalLength - user.hackathonsJoined.length} malformed hackathon entries`);
  }

  // Validate the entry before adding
  if (!newHackathonEntry.hackathonId || !newHackathonEntry.hackathonName || !newHackathonEntry.teamName) {
    console.error("❌ Invalid hackathon entry:", newHackathonEntry);
    res.status(500);
    throw new Error("Invalid hackathon entry data");
  }

  // Add to user's hackathonsJoined array
  user.hackathonsJoined.push(newHackathonEntry);

  console.log("💾 About to save user with hackathon entry...");
  console.log("🔍 Final hackathonsJoined array:", JSON.stringify(user.hackathonsJoined, null, 2));
  
  try {
    await user.save();
    console.log("✅ User saved successfully");
  } catch (saveError) {
    console.error("❌ Save error details:", {
      message: saveError.message,
      errors: saveError.errors,
      name: saveError.name,
      validationErrors: saveError.errors ? Object.keys(saveError.errors).map(key => ({
        field: key,
        message: saveError.errors[key].message,
        value: saveError.errors[key].value
      })) : null
    });
    throw saveError;
  }

  console.log("✅ User joined hackathon as leader:", {
    email: user.email,
    hackathon: hackathon.name,
    team: teamName
  });

  // Return the newly created entry
  const createdEntry = user.hackathonsJoined[user.hackathonsJoined.length - 1];

  res.status(200).json({
    message: "Successfully joined hackathon as team leader",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      hackathonsJoined: user.hackathonsJoined
    },
    hackathonEntry: createdEntry
  });
});

/**
 * @desc    Invite team member by email
 * @route   POST /api/team/invite
 * @access  Private
 */
export const inviteTeamMember = asyncHandler(async (req, res) => {
  const { email, hackathonId } = req.body;
  const leaderId = req.user._id;

  console.log("📧 Invite team member:", { email, hackathonId, leaderId: req.user.email });

  if (!email || !hackathonId) {
    res.status(400);
    throw new Error("Email and hackathon ID are required");
  }

  // Get leader user
  const leader = await User.findById(leaderId);
  if (!leader) {
    res.status(404);
    throw new Error("Leader not found");
  }

  // Find the specific hackathon entry for the leader
  console.log("🔍 Looking for hackathon entry:", { 
    hackathonId, 
    leaderHackathons: leader.hackathonsJoined.map(h => ({ 
      id: h.hackathonId?._id ? h.hackathonId._id.toString() : h.hackathonId?.toString(), 
      isLeader: h.isTeamLeader 
    })) 
  });
  
  const leaderHackathonEntry = (leader.hackathonsJoined || []).find(
    entry => {
      const entryId = entry.hackathonId?._id ? entry.hackathonId._id.toString() : entry.hackathonId?.toString();
      return entryId === hackathonId && entry.isTeamLeader;
    }
  );

  if (!leaderHackathonEntry) {
    res.status(403);
    throw new Error("You are not a team leader for this hackathon");
  }

  // Check if invitee exists
  const invitee = await User.findOne({ email: email.toLowerCase().trim() });
  if (!invitee) {
    res.status(404);
    throw new Error("User with this email not found");
  }

  // Check if invitee is already part of this hackathon
  const inviteeExistingEntry = (invitee.hackathonsJoined || []).find(
    entry => entry.hackathonId && entry.hackathonId.toString() === hackathonId
  );

  if (inviteeExistingEntry) {
    res.status(400);
    throw new Error("User is already part of a team for this hackathon");
  }

  // Check if invitation already exists in leader's team
  const existingInvite = leaderHackathonEntry.teamMembers.find(
    member => member.email.toLowerCase() === email.toLowerCase()
  );

  if (existingInvite) {
    res.status(400);
    throw new Error("Invitation already sent to this user");
  }

  // Add invitation to leader's team members for this hackathon
  leaderHackathonEntry.teamMembers.push({
    name: invitee.name,
    email: invitee.email,
    status: "pending",
    invitedAt: new Date()
  });

  // Initialize invitee's hackathonsJoined array if it doesn't exist
  if (!invitee.hackathonsJoined) {
    invitee.hackathonsJoined = [];
  }

  // Also create a pending entry in invitee's hackathonsJoined array
  invitee.hackathonsJoined.push({
    hackathonId: hackathonId,
    hackathonName: leaderHackathonEntry.hackathonName,
    teamName: leaderHackathonEntry.teamName,
    projectName: leaderHackathonEntry.projectName,
    isTeamLeader: false,
    teamLeaderEmail: leader.email,
    teamMembers: [{
      name: invitee.name,
      email: invitee.email,
      status: "pending",
      invitedAt: new Date()
    }]
  });

  await leader.save();
  await invitee.save();

  console.log("✅ Invitation sent to:", email, "for hackathon:", leaderHackathonEntry.hackathonName);

  res.status(200).json({
    message: "Invitation sent successfully",
    invitedUser: {
      name: invitee.name,
      email: invitee.email
    },
    hackathon: {
      name: leaderHackathonEntry.hackathonName,
      teamName: leaderHackathonEntry.teamName,
      members: leaderHackathonEntry.teamMembers
    }
  });
});

/**
 * @desc    Accept or reject team invitation
 * @route   POST /api/team/respond
 * @access  Private
 */
export const respondToInvite = asyncHandler(async (req, res) => {
  const { leaderEmail, hackathonId, response } = req.body; // response: "accepted" | "rejected"
  const userId = req.user._id;
  const userEmail = req.user.email;

  console.log("🤝 Respond to invite:", { userEmail, leaderEmail, hackathonId, response });

  if (!leaderEmail || !hackathonId || !response) {
    res.status(400);
    throw new Error("Leader email, hackathon ID, and response are required");
  }

  if (!["accepted", "rejected"].includes(response)) {
    res.status(400);
    throw new Error("Response must be 'accepted' or 'rejected'");
  }

  // Get current user and leader
  const user = await User.findById(userId);
  const leader = await User.findOne({ email: leaderEmail.toLowerCase().trim() });

  if (!user || !leader) {
    res.status(404);
    throw new Error("User or leader not found");
  }

  // Find the pending invitation in user's hackathonsJoined array
  const userHackathonIndex = (user.hackathonsJoined || []).findIndex(
    entry => entry.hackathonId && entry.hackathonId.toString() === hackathonId && 
             entry.teamLeaderEmail && entry.teamLeaderEmail.toLowerCase() === leaderEmail.toLowerCase()
  );

  if (userHackathonIndex === -1) {
    res.status(404);
    throw new Error("Invitation not found");
  }

  const userHackathonEntry = user.hackathonsJoined[userHackathonIndex];

  // Find corresponding entry in leader's hackathonsJoined array
  const leaderHackathonEntry = (leader.hackathonsJoined || []).find(
    entry => entry.hackathonId && entry.hackathonId.toString() === hackathonId && entry.isTeamLeader
  );

  if (!leaderHackathonEntry) {
    res.status(404);
    throw new Error("Leader's hackathon entry not found");
  }

  // Find the invitation in leader's team members
  const inviteIndex = leaderHackathonEntry.teamMembers.findIndex(
    member => member.email.toLowerCase() === userEmail.toLowerCase()
  );

  if (inviteIndex === -1) {
    res.status(404);
    throw new Error("Invitation not found in leader's team");
  }

  const invite = leaderHackathonEntry.teamMembers[inviteIndex];

  if (invite.status !== "pending") {
    res.status(400);
    throw new Error("Invitation has already been responded to");
  }

  if (response === "accepted") {
    // Update invitation status in leader's team
    leaderHackathonEntry.teamMembers[inviteIndex].status = "accepted";
    leaderHackathonEntry.teamMembers[inviteIndex].respondedAt = new Date();

    // Update user's hackathon entry to accepted status
    user.hackathonsJoined[userHackathonIndex].teamMembers[0].status = "accepted";
    user.hackathonsJoined[userHackathonIndex].teamMembers[0].respondedAt = new Date();

    await leader.save();
    await user.save();

    console.log("✅ User accepted invitation and joined team:", {
      user: userEmail,
      hackathon: userHackathonEntry.hackathonName,
      team: userHackathonEntry.teamName
    });

    res.status(200).json({
      message: "Successfully joined the team",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hackathonsJoined: user.hackathonsJoined
      },
      hackathonEntry: user.hackathonsJoined[userHackathonIndex]
    });
  } else {
    // Remove rejected invitation from both users
    leaderHackathonEntry.teamMembers.splice(inviteIndex, 1);
    user.hackathonsJoined.splice(userHackathonIndex, 1);

    await leader.save();
    await user.save();

    console.log("❌ User rejected invitation:", {
      user: userEmail,
      hackathon: userHackathonEntry.hackathonName
    });

    res.status(200).json({
      message: "Invitation rejected",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hackathonsJoined: user.hackathonsJoined
      }
    });
  }
});

/**
 * @desc    Get team details for a user (all hackathons)
 * @route   GET /api/team/:userId
 * @access  Private
 */
export const getTeamDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log("👥 Get team details for user:", userId);

  const user = await User.findById(userId).populate('hackathonsJoined.hackathonId').select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Process all hackathon entries
  const hackathonDetails = await Promise.all(
    (user.hackathonsJoined || []).map(async (entry) => {
      let teamData = {
        hackathonId: entry.hackathonId._id ? entry.hackathonId._id.toString() : entry.hackathonId.toString(),
        hackathonName: entry.hackathonName,
        teamName: entry.teamName,
        projectName: entry.projectName,
        isTeamLeader: entry.isTeamLeader,
        joinedAt: entry.joinedAt,
        role: entry.isTeamLeader ? "leader" : "member",
        members: []
      };

      if (entry.isTeamLeader) {
        // User is team leader for this hackathon
        teamData.members = entry.teamMembers;
        teamData.leader = {
          name: user.name,
          email: user.email
        };
      } else {
        // User is team member, find the leader
        const leader = await User.findOne({
          email: entry.teamLeaderEmail,
          'hackathonsJoined.hackathonId': entry.hackathonId,
          'hackathonsJoined.isTeamLeader': true
        }).select("-password");

        if (leader) {
          const leaderEntry = leader.hackathonsJoined.find(
            le => le.hackathonId.toString() === entry.hackathonId.toString() && le.isTeamLeader
          );
          
          if (leaderEntry) {
            teamData.members = leaderEntry.teamMembers;
            teamData.leader = {
              name: leader.name,
              email: leader.email
            };
          }
        }
      }

      return teamData;
    })
  );

  console.log(`👥 Found ${hackathonDetails.length} hackathon entries for user:`, user.email);

  res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      hackathonsJoined: user.hackathonsJoined
    },
    hackathons: hackathonDetails
  });
});

/**
 * @desc    Get pending team requests for current user
 * @route   GET /api/team/requests/pending
 * @access  Private
 */
export const getTeamRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;

  console.log("📋 Get pending requests for:", userEmail);

  // Get current user with their hackathon entries
  const user = await User.findById(userId).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find all pending invitations in user's hackathonsJoined array
  const pendingRequests = (user.hackathonsJoined || [])
    .filter(entry => 
      !entry.isTeamLeader && 
      entry.teamMembers && entry.teamMembers.length > 0 && 
      entry.teamMembers[0].status === "pending"
    )
    .map(entry => ({
      id: `${entry.hackathonId}_${entry.teamLeaderEmail}`,
      hackathonId: entry.hackathonId,
      hackathonName: entry.hackathonName,
      teamName: entry.teamName,
      projectName: entry.projectName,
      leaderEmail: entry.teamLeaderEmail,
      invitedAt: entry.teamMembers[0].invitedAt
    }));

  // Get leader names for the requests
  const requestsWithLeaderNames = await Promise.all(
    pendingRequests.map(async (request) => {
      const leader = await User.findOne({ email: request.leaderEmail }).select("name");
      return {
        ...request,
        leaderName: leader ? leader.name : "Unknown Leader"
      };
    })
  );

  console.log(`📋 Found ${requestsWithLeaderNames.length} pending requests`);

  res.status(200).json({
    requests: requestsWithLeaderNames
  });
});