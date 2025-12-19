import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { joinHackathonAsLeader, getTeamDetails } from '@/api/team';
import { useAuth } from '@/contexts/AuthContext';

const TestMultipleHackathons = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teamDetails, setTeamDetails] = useState(null);

  // Real hackathon data from our seeded database
  const mockHackathons = [
    { _id: '690af4d01fe69883b23f515c', name: 'AI Innovation Challenge 2024' },
    { _id: '690af4d01fe69883b23f515d', name: 'Green Tech Hackathon' },
    { _id: '690af4d01fe69883b23f515e', name: 'FinTech Revolution' }
  ];

  const handleJoinHackathon = async (hackathon) => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to join hackathons',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await joinHackathonAsLeader(
        hackathon._id,
        `Team ${user.name} - ${hackathon.name.split(' ')[0]}`,
        `Project for ${hackathon.name}`
      );

      toast({
        title: 'Success!',
        description: `Joined ${hackathon.name} as team leader`
      });

      console.log('Join response:', response);
      
      // Refresh team details
      await fetchTeamDetails();
    } catch (error) {
      toast({
        title: 'Failed to join',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async () => {
    if (!user?._id) return;
    
    try {
      const response = await getTeamDetails(user._id);
      setTeamDetails(response);
      console.log('Team details:', response);
    } catch (error) {
      console.error('Failed to fetch team details:', error);
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <p className="text-white">Please log in to test multiple hackathons feature.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-white mb-4">Test Multiple Hackathons</h3>
        
        <div className="space-y-3 mb-6">
          {mockHackathons.map((hackathon) => (
            <div key={hackathon._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-white">{hackathon.name}</span>
              <Button
                onClick={() => handleJoinHackathon(hackathon)}
                disabled={loading}
                className="glass-button text-sm px-4 py-2"
              >
                {loading ? 'Joining...' : 'Join as Leader'}
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={fetchTeamDetails}
          className="glass-button"
        >
          Refresh Team Details
        </Button>
      </div>

      {teamDetails && (
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-lg font-bold text-white mb-4">Current Team Details</h4>
          <pre className="text-gray-300 text-sm overflow-auto">
            {JSON.stringify(teamDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestMultipleHackathons;