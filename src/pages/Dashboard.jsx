// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Helmet } from 'react-helmet';
// import { Calendar, Users, Brain, Trophy, ArrowRight, Sparkles } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from '@/components/ui/use-toast';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth');
//     }
//   }, [user, navigate]);

//   if (!user) return null;

//   const quickStats = [
//     { label: 'Hackathons Joined', value: '3', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
//     { label: 'Team Connections', value: '12', icon: Users, color: 'from-blue-500 to-purple-500' },
//     { label: 'AI Sessions', value: '8', icon: Brain, color: 'from-green-500 to-teal-500' },
//     { label: 'Skills Verified', value: user.skills?.length || 0, icon: Sparkles, color: 'from-pink-500 to-rose-500' }
//   ];

//   const upcomingHackathons = [
//     {
//       id: 1,
//       name: 'AI Innovation Challenge',
//       date: '2024-03-15',
//       theme: 'Artificial Intelligence',
//       participants: 1200,
//       prize: '$50,000'
//     },
//     {
//       id: 2,
//       name: 'Green Tech Hackathon',
//       date: '2024-03-22',
//       theme: 'Sustainability',
//       participants: 800,
//       prize: '$25,000'
//     },
//     {
//       id: 3,
//       name: 'FinTech Revolution',
//       date: '2024-04-05',
//       theme: 'Financial Technology',
//       participants: 1500,
//       prize: '$75,000'
//     }
//   ];

//   const suggestedTeammates = [
//     {
//       id: 1,
//       name: 'Sarah Chen',
//       skills: ['React', 'Node.js', 'UI/UX'],
//       experience: '3 years',
//       avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
//     },
//     {
//       id: 2,
//       name: 'Marcus Johnson',
//       skills: ['Python', 'Machine Learning', 'Data Science'],
//       experience: '5 years',
//       avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
//     },
//     {
//       id: 3,
//       name: 'Elena Rodriguez',
//       skills: ['Flutter', 'Firebase', 'Mobile Dev'],
//       experience: '4 years',
//       avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena'
//     }
//   ];

//   // const handleFeatureClick = (feature) => {
//   //   toast({
//   //     title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
//   //   });
//   // };

//   return (
//     <>
//       <Helmet>
//         <title>Dashboard - SyncUp</title>
//         <meta name="description" content="Your personalized SyncUp dashboard with hackathons, team matching, and AI coaching insights." />
//         <meta property="og:title" content="Dashboard - SyncUp" />
//         <meta property="og:description" content="Your personalized SyncUp dashboard with hackathons, team matching, and AI coaching insights." />
//       </Helmet>

//       <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Welcome Header */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="mb-8"
//           >
//             <h1 className="text-4xl font-bold text-white mb-2">
//               Welcome back, <span className="gradient-text">{user.name}</span>! 👋
//             </h1>
//             <p className="text-gray-400 text-lg">
//               Ready to build something amazing? Let's find your next hackathon adventure.
//             </p>
//           </motion.div>

//           {/* Quick Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
//           >
//             {quickStats.map((stat, index) => (
//               <div key={stat.label} className="glass-card p-6 rounded-xl">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-400 text-sm">{stat.label}</p>
//                     <p className="text-2xl font-bold text-white">{stat.value}</p>
//                   </div>
//                   <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
//                     <stat.icon className="h-6 w-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </motion.div>

//           {/* Main Dashboard Tabs */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//           >
//             <Tabs defaultValue="hackathons" className="space-y-6">
//               <TabsList className="glass-card p-1 bg-white/5 border border-white/10">
//                 <TabsTrigger value="hackathons" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
//                   <Calendar className="h-4 w-4 mr-2" />
//                   Hackathon Explorer
//                 </TabsTrigger>
//                 <TabsTrigger value="matchmaking" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
//                   <Users className="h-4 w-4 mr-2" />
//                   Team Matchmaking
//                 </TabsTrigger>
//                 <TabsTrigger value="ai-coach" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
//                   <Brain className="h-4 w-4 mr-2" />
//                   AI Coach
//                 </TabsTrigger>
//               </TabsList>

//               {/* Hackathon Explorer Tab */}
//               <TabsContent value="hackathons" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">Upcoming Hackathons</h2>
//                   <Button 
//                     onClick={() => navigate('/explorer')}
//                     className="glass-button"
//                   >
//                     View All
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {upcomingHackathons.map((hackathon) => (
//                     <div key={hackathon.id} className="hackathon-card p-6 rounded-xl">
//                       <div className="flex justify-between items-start mb-4">
//                         <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
//                           <Trophy className="h-5 w-5 text-blue-400" />
//                         </div>
//                         <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
//                           {hackathon.theme}
//                         </span>
//                       </div>
//                       <h3 className="text-lg font-semibold text-white mb-2">{hackathon.name}</h3>
//                       <p className="text-gray-400 text-sm mb-4">
//                         {new Date(hackathon.date).toLocaleDateString('en-US', { 
//                           month: 'long', 
//                           day: 'numeric', 
//                           year: 'numeric' 
//                         })}
//                       </p>
//                       <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
//                         <span>{hackathon.participants} participants</span>
//                         <span className="text-green-400 font-semibold">{hackathon.prize}</span>
//                       </div>
//                       <Button 
//                         // onClick={() => handleFeatureClick('join-hackathon')}
//                         className="w-full glass-button"
//                       >
//                         Join Hackathon
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               </TabsContent>

//               {/* Team Matchmaking Tab */}
//               <TabsContent value="matchmaking" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">Suggested Teammates</h2>
//                   <Button 
//                     onClick={() => navigate('/matchmaking')}
//                     className="glass-button"
//                   >
//                     View All
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {suggestedTeammates.map((teammate) => (
//                     <div key={teammate.id} className="teammate-card p-6 rounded-xl">
//                       <div className="flex items-center mb-4">
//                         <img 
//                           src={teammate.avatar} 
//                           alt={teammate.name}
//                           className="w-12 h-12 rounded-full mr-4"
//                         />
//                         <div>
//                           <h3 className="text-lg font-semibold text-white">{teammate.name}</h3>
//                           <p className="text-gray-400 text-sm">{teammate.experience}</p>
//                         </div>
//                       </div>
//                       <div className="flex flex-wrap gap-2 mb-4">
//                         {teammate.skills.map((skill) => (
//                           <span key={skill} className="skill-chip px-2 py-1 rounded-full text-xs">
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                       <Button 
//                         // onClick={() => handleFeatureClick('connect-teammate')}
//                         className="w-full glass-button"
//                       >
//                         Connect
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               </TabsContent>

//               {/* AI Coach Tab */}
//               <TabsContent value="ai-coach" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">AI Coach Insights</h2>
//                   <Button 
//                     onClick={() => navigate('/ai-coach')}
//                     className="glass-button"
//                   >
//                     Open Chat
//                     <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </div>
//                 <div className="glass-card p-8 rounded-xl">
//                   <div className="text-center">
//                     <div className="p-4 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20 w-fit mx-auto mb-4">
//                       <Brain className="h-8 w-8 text-green-400" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Coaching?</h3>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                       Get personalized advice on project ideas, team dynamics, and winning strategies from our AI coach.
//                     </p>
//                     <Button 
//                       onClick={() => navigate('/ai-coach')}
//                       className="glass-button"
//                     >
//                       Start Coaching Session
//                     </Button>
//                   </div>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </motion.div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;


// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Helmet } from 'react-helmet';
// import { Calendar, Users, Brain, Trophy, ArrowRight, Sparkles } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from '@/components/ui/use-toast';
// import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// const Dashboard = () => {
//   const { user, loading, fetchProfile} = useAuth();
//   const navigate = useNavigate();

//   // remote data
//   const [hackathons, setHackathons] = useState(null); // null = loading
//   const [users, setUsers] = useState(null);
//   const [fetchingHackathons, setFetchingHackathons] = useState(false);
//   const [fetchingUsers, setFetchingUsers] = useState(false);
//   const [hackathonsError, setHackathonsError] = useState(null);
//   const [usersError, setUsersError] = useState(null);

//   // redirect to auth when we know user is unauthenticated
//   useEffect(() => {
//     if (!loading && !user) navigate('/auth');
//   }, [user, loading, navigate]);

//   // fetch hackathons
//   useEffect(() => {
//     let cancelled = false;
//     const fetchHackathons = async () => {
//       setFetchingHackathons(true);
//       setHackathonsError(null);
//       try {
//         const res = await axios.get(`${API_BASE}/api/hackathons`, { timeout: 10000 });
//         if (cancelled) return;
//         setHackathons(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         console.error('Failed to fetch hackathons:', err);
//         setHackathons([]);
//         setHackathonsError(err.response?.data?.message || err.message || 'Failed to load hackathons');
//         toast({ title: 'Failed to fetch hackathons', description: err.message || 'See console', variant: 'destructive' });
//       } finally {
//         if (!cancelled) setFetchingHackathons(false);
//       }
//     };
//     fetchHackathons();
//     return () => { cancelled = true; };
//   }, []);

//   // fetch users (public)
//   useEffect(() => {
//     let cancelled = false;
//     const fetchUsers = async () => {
//       setFetchingUsers(true);
//       setUsersError(null);
//       try {
//         const res = await axios.get(`${API_BASE}/api/users`, { timeout: 10000 });
//         if (cancelled) return;
//         setUsers(Array.isArray(res.data) ? res.data : []);
//       } catch (err) {
//         console.error('Failed to fetch users:', err);
//         setUsers([]);
//         setUsersError(err.response?.data?.message || err.message || 'Failed to load users');
//         toast({ title: 'Failed to fetch users', description: err.message || 'See console', variant: 'destructive' });
//       } finally {
//         if (!cancelled) setFetchingUsers(false);
//       }
//     };
//     fetchUsers();
//     return () => { cancelled = true; };
//   }, []);

//   // Quick stats uses user info; wait for user
//   // const quickStats = useMemo(() => [
//   //   { label: 'Hackathons Joined', value: '3', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
//   //   { label: 'Team Connections', value: '12', icon: Users, color: 'from-blue-500 to-purple-500' },
//   //   { label: 'AI Sessions', value: '8', icon: Brain, color: 'from-green-500 to-teal-500' },
//   //   { label: 'Skills Verified', value: String(user?.skills?.length ?? 0), icon: Sparkles, color: 'from-pink-500 to-rose-500' }
//   // ], [user?.skills]);
// const quickStats = useMemo(() => {
//   // { label: 'Hackathons Joined', value: String(user?.hackathonsJoined ?? 0), icon: Trophy, color: 'from-yellow-500 to-orange-500' },
//   // { label: 'Team Connections', value: String(user?.teamConnections ?? 0), icon: Users, color: 'from-blue-500 to-purple-500' },
//   // { label: 'AI Sessions', value: String(user?.aiSessions ?? 0), icon: Brain, color: 'from-green-500 to-teal-500' },
//   // { label: 'Skills Verified', value: String(user?.skillsVerified ?? 0), icon: Sparkles, color: 'from-pink-500 to-rose-500' }
//   const hackathonCount = Array.isArray(user?.hackathons)
//     ? user.hackathons.length
//     : (typeof user?.hackathonsJoined === 'number' ? user.hackathonsJoined : 0);

//   return [
//     { label: 'Hackathons Joined', value: String(hackathonCount ?? 0), icon: Trophy, color: 'from-yellow-500 to-orange-500' },
//     { label: 'Team Connections', value: String(user?.teamConnections ?? 0), icon: Users, color: 'from-blue-500 to-purple-500' },
//     { label: 'AI Sessions', value: String(user?.aiSessions ?? 0), icon: Brain, color: 'from-green-500 to-teal-500' },
//     { label: 'Skills Verified', value: String(user?.skillsVerified ?? 0), icon: Sparkles, color: 'from-pink-500 to-rose-500' }
//   ];
// }, [user]);

//   // Compute upcoming hackathons: pick those with date >= today and sort by date ascending
//   const upcomingHackathons = useMemo(() => {
//     if (!hackathons) return [];
//     const now = Date.now();
//     const parsed = hackathons
//       .map(h => ({ ...h, _date: h.date ? new Date(h.date).getTime() : null }))
//       .filter(h => h._date === null || h._date >= now) // keep upcoming or undated
//       .sort((a, b) => {
//         if (a._date === null) return 1;
//         if (b._date === null) return -1;
//         return a._date - b._date;
//       });
//     return parsed;
//   }, [hackathons]);

//   // Suggested teammates: match users by overlapping skills with current user
//   // Scoring: number of shared skills; return top 6 (excluding current user)
//   const suggestedTeammates = useMemo(() => {
//     if (!users || !user) return [];
//     const mine = Array.isArray(user.skills) ? user.skills.map(s => String(s).toLowerCase().trim()) : [];
//     if (mine.length === 0) {
//       // fallback: show some users (first 6), excluding self
//       return users.filter(u => String(u._id) !== String(user._id)).slice(0, 6).map(mapUserToTeammate);
//     }

//     // compute intersection score
//     const scored = users
//       .filter(u => String(u._id) !== String(user._id)) // exclude self
//       .map(u => {
//         const theirSkills = Array.isArray(u.skills) ? u.skills.map(s => String(s).toLowerCase().trim()) : [];
//         const shared = theirSkills.filter(s => mine.includes(s));
//         return { user: u, score: shared.length };
//       })
//       .filter(x => x.score > 0) // only those with at least one match
//       .sort((a, b) => b.score - a.score || (a.user.name || '').localeCompare(b.user.name))
//       .slice(0, 6)
//       .map(x => mapUserToTeammate(x.user));

//     // if none matched, fallback to some users
//     if (scored.length === 0) {
//       return users.filter(u => String(u._id) !== String(user._id)).slice(0, 6).map(mapUserToTeammate);
//     }
//     return scored;
//   }, [users, user]);

//   // helper to map backend user to the UI teammate shape used in your dashboard snippet
//   function mapUserToTeammate(u) {
//     return {
//       id: u._id,
//       name: u.name || 'Unknown',
//       skills: Array.isArray(u.skills) ? u.skills : (u.skills ? String(u.skills).split(',').map(s => s.trim()) : []),
//       experience: u.experience || '',
//       avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u._id)}`,
//       title: u.title || u.bio || '',
//       preferredRoles: Array.isArray(u.preferredRoles) ? u.preferredRoles : [],
//       availability: u.availability || 'Available',
//       bio: u.bio || '',
//     };
//   }

//   const formatDate = (d) => {
//     try {
//       if (!d) return 'TBD';
//       const date = new Date(d);
//       if (isNaN(date.getTime())) return d;
//       return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
//     } catch {
//       return d;
//     }
//   };

//   // guards & loading UI
//   if (loading || fetchingHackathons || fetchingUsers || hackathons === null || users === null) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-gray-400">Loading dashboard…</div>
//       </div>
//     );
//   }

//   if (!user) return null; // redirect already handled by useEffect

//   return (
//     <>
//       <Helmet>
//         <title>Dashboard - SyncUp</title>
//         <meta name="description" content="Your personalized SyncUp dashboard with hackathons, team matching, and AI coaching insights." />
//       </Helmet>

//       <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Welcome Header */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
//             <h1 className="text-4xl font-bold text-white mb-2">
//               Welcome back, <span className="gradient-text">{user.name}</span>! 👋
//             </h1>
//             <p className="text-gray-400 text-lg">Ready to build something amazing? Let's find your next hackathon adventure.</p>
//           </motion.div>

//           {/* Quick Stats */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {quickStats.map((stat) => (
//               <div key={stat.label} className="glass-card p-6 rounded-xl">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-400 text-sm">{stat.label}</p>
//                     <p className="text-2xl font-bold text-white">{stat.value}</p>
//                   </div>
//                   <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
//                     <stat.icon className="h-6 w-6 text-white" />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </motion.div>

//           {/* Main Dashboard Tabs */}
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
//             <Tabs defaultValue="hackathons" className="space-y-6">
//               <TabsList className="glass-card p-1 bg-white/5 border border-white/10">
//                 <TabsTrigger value="hackathons" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
//                   <Calendar className="h-4 w-4 mr-2" />
//                   Hackathon Explorer
//                 </TabsTrigger>
//                 <TabsTrigger value="matchmaking" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
//                   <Users className="h-4 w-4 mr-2" />
//                   Team Matchmaking
//                 </TabsTrigger>
//                 <TabsTrigger value="ai-coach" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
//                   <Brain className="h-4 w-4 mr-2" />
//                   AI Coach
//                 </TabsTrigger>
//               </TabsList>

//               {/* Hackathon Explorer Tab (uses upcomingHackathons) */}
//               <TabsContent value="hackathons" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">Upcoming Hackathons</h2>
//                   <Button onClick={() => navigate('/explorer')} className="glass-button">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
//                 </div>

//                 {hackathonsError ? (
//                   <div className="text-red-400">Error loading hackathons: {hackathonsError}</div>
//                 ) : upcomingHackathons.length === 0 ? (
//                   <div className="text-gray-400">No upcoming hackathons found.</div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {upcomingHackathons.slice(0, 6).map((hackathon) => (
//                       <div key={hackathon._id || hackathon.id} className="hackathon-card p-6 rounded-xl">
//                         <div className="flex justify-between items-start mb-4">
//                           <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
//                             <Trophy className="h-5 w-5 text-blue-400" />
//                           </div>
//                           <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">{hackathon.theme || 'General'}</span>
//                         </div>

//                         <h3 className="text-lg font-semibold text-white mb-2">{hackathon.name}</h3>
//                         <p className="text-gray-400 text-sm mb-4">{formatDate(hackathon.date)}</p>

//                         <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
//                           {/* <span>{hackathon.participants ?? '—'} participants</span> */}
//                           <span>
//   {Array.isArray(hackathon.participants) 
//     ? hackathon.participants.map(p => p.name).join(', ') 
//     : '—'}
// </span>

//                           <span className="text-green-400 font-semibold">{hackathon.prize ?? '—'}</span>
//                         </div>

//                         <Button onClick={() => navigate(`/hackathons/${hackathon._id || hackathon.id}`)} className="w-full glass-button">View</Button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </TabsContent>

//               {/* Team Matchmaking Tab (uses suggestedTeammates) */}
//               <TabsContent value="matchmaking" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">Suggested Teammates</h2>
//                   <Button onClick={() => navigate('/matchmaking')} className="glass-button">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
//                 </div>

//                 {usersError ? (
//                   <div className="text-red-400">Error loading users: {usersError}</div>
//                 ) : suggestedTeammates.length === 0 ? (
//                   <div className="text-gray-400">No suggested teammates found. Make sure your profile lists skills to match against.</div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {suggestedTeammates.map((t) => (
//                       <div key={t.id} className="teammate-card p-6 rounded-xl">
//                         <div className="flex items-center mb-4">
//                           <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
//                           <div>
//                             <h3 className="text-lg font-semibold text-white">{t.name}</h3>
//                             <p className="text-gray-400 text-sm">{t.experience}</p>
//                           </div>
//                         </div>

//                         <div className="flex flex-wrap gap-2 mb-4">
//                           {(t.skills || []).slice(0, 6).map(skill => (
//                             <span key={skill} className="skill-chip px-2 py-1 rounded-full text-xs">{skill}</span>
//                           ))}
//                         </div>

//                         <Button onClick={() => toast({ title: 'Connect', description: `Send connection request to ${t.name}` })} className="w-full glass-button">Connect</Button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </TabsContent>

//               {/* AI Coach Tab */}
//               <TabsContent value="ai-coach" className="space-y-6">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-2xl font-bold text-white">AI Coach Insights</h2>
//                   <Button onClick={() => navigate('/ai-coach')} className="glass-button">Open Chat <ArrowRight className="ml-2 h-4 w-4" /></Button>
//                 </div>

//                 <div className="glass-card p-8 rounded-xl">
//                   <div className="text-center">
//                     <div className="p-4 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20 w-fit mx-auto mb-4">
//                       <Brain className="h-8 w-8 text-green-400" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Coaching?</h3>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">Get personalized advice on project ideas, team dynamics, and winning strategies from our AI coach.</p>
//                     <Button onClick={() => navigate('/ai-coach')} className="glass-button">Start Coaching Session</Button>
//                   </div>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </motion.div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;


// --------------------------------------------------------------------------------------------------


// fe/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Users, Brain, Trophy, ArrowRight, Sparkles, Trophy as TrophyIcon, Crown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import TeamManagement from '@/components/team/TeamManagement';
import TeamRequests from '@/components/team/TeamRequests';
import MultipleHackathonsManager from '@/components/team/MultipleHackathonsManager';
import TestMultipleHackathons from '@/components/team/TestMultipleHackathons';
import { getTeamDetails } from '@/api/team';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { user, loading, fetchProfile } = useAuth(); // fetchProfile added
  const navigate = useNavigate();

  // remote data
  const [hackathons, setHackathons] = useState(null); // null = loading
  const [users, setUsers] = useState(null);
  const [fetchingHackathons, setFetchingHackathons] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [hackathonsError, setHackathonsError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  
  // Team management state
  const [teamData, setTeamData] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
useEffect(() => {
  console.debug('Dashboard user from AuthContext:', user);
}, [user]);

  // redirect to auth when we know user is unauthenticated
  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  // --- NEW: refresh profile on mount so dashboard reads fresh server-side data
  useEffect(() => {
    const token = localStorage.getItem('syncup_token') || localStorage.getItem('token');
    if (token && typeof fetchProfile === 'function') {
      // don't block render — refresh in background
      fetchProfile(token).catch(err => {
        // not fatal: log for debugging
        console.warn('Dashboard: profile refresh failed', err);
      });
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch team data when user is available
  useEffect(() => {
    if (user?._id) {
      fetchTeamData();
    }
  }, [user?._id]);

  const fetchTeamData = async () => {
    if (!user?._id) return;
    
    setLoadingTeam(true);
    try {
      const token = localStorage.getItem('syncup_token');
      
      // Get all hackathons
      const hackathonsRes = await axios.get(`${API_BASE}/api/hackathons`);
      const allHackathons = hackathonsRes.data;

      // For each hackathon, check if user is registered with a team
      const teamsData = [];
      for (const hackathon of allHackathons) {
        try {
          const regRes = await axios.get(
            `${API_BASE}/api/hackathons/${hackathon._id}/my-registration`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (regRes.data && regRes.data.teamId) {
            teamsData.push({
              hackathon: hackathon,
              team: regRes.data.teamId,
              role: regRes.data.role
            });
          }
        } catch (err) {
          // Not registered for this hackathon, skip
        }
      }

      setTeamData(teamsData);
    } catch (error) {
      console.warn('Failed to fetch team data:', error);
      setTeamData([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  // fetch hackathons
  useEffect(() => {
    let cancelled = false;
    const fetchHackathons = async () => {
      setFetchingHackathons(true);
      setHackathonsError(null);
      try {
        const res = await axios.get(`${API_BASE}/api/hackathons`, { timeout: 10000 });
        if (cancelled) return;
        setHackathons(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch hackathons:', err);
        setHackathons([]);
        setHackathonsError(err.response?.data?.message || err.message || 'Failed to load hackathons');
        toast({ title: 'Failed to fetch hackathons', description: err.message || 'See console', variant: 'destructive' });
      } finally {
        if (!cancelled) setFetchingHackathons(false);
      }
    };
    fetchHackathons();
    return () => { cancelled = true; };
  }, []);

  // fetch users (public)
  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      setFetchingUsers(true);
      setUsersError(null);
      try {
        const res = await axios.get(`${API_BASE}/api/users`, { timeout: 10000 });
        if (cancelled) return;
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
        setUsersError(err.response?.data?.message || err.message || 'Failed to load users');
        toast({ title: 'Failed to fetch users', description: err.message || 'See console', variant: 'destructive' });
      } finally {
        if (!cancelled) setFetchingUsers(false);
      }
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, []);

  // Quick stats uses user info and team data
  const quickStats = useMemo(() => {
    const hackathonCount = Array.isArray(teamData) ? teamData.length : 0;
    const teamsWithRole = Array.isArray(teamData) ? teamData.filter(t => t.team).length : 0;

    return [
      { label: 'Hackathons Joined', value: String(hackathonCount), icon: Trophy, color: 'from-yellow-500 to-orange-500' },
      { label: 'Skills', value: String(user?.skills?.length ?? 0), icon: Users, color: 'from-blue-500 to-purple-500' },
      { label: 'Active Teams', value: String(teamsWithRole), icon: Brain, color: 'from-green-500 to-teal-500' },
      { label: 'Profile Complete', value: user?.bio ? '100%' : '75%', icon: Sparkles, color: 'from-pink-500 to-rose-500' }
    ];
  }, [user, teamData]);

  // Compute upcoming hackathons: pick those with date >= today and sort by date ascending
  const upcomingHackathons = useMemo(() => {
    if (!hackathons) return [];
    const now = Date.now();
    const parsed = hackathons
      .map(h => ({ ...h, _date: h.date ? new Date(h.date).getTime() : null }))
      .filter(h => h._date === null || h._date >= now) // keep upcoming or undated
      .sort((a, b) => {
        if (a._date === null) return 1;
        if (b._date === null) return -1;
        return a._date - b._date;
      });
    return parsed;
  }, [hackathons]);

  // Suggested teammates: match users by overlapping skills with current user
  const suggestedTeammates = useMemo(() => {
    if (!users || !user) return [];
    const mine = Array.isArray(user.skills) ? user.skills.map(s => String(s).toLowerCase().trim()) : [];
    if (mine.length === 0) {
      return users.filter(u => String(u._id) !== String(user._id)).slice(0, 6).map(mapUserToTeammate);
    }

    const scored = users
      .filter(u => String(u._id) !== String(user._id))
      .map(u => {
        const theirSkills = Array.isArray(u.skills) ? u.skills.map(s => String(s).toLowerCase().trim()) : [];
        const shared = theirSkills.filter(s => mine.includes(s));
        return { user: u, score: shared.length };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || (a.user.name || '').localeCompare(b.user.name))
      .slice(0, 6)
      .map(x => mapUserToTeammate(x.user));

    if (scored.length === 0) {
      return users.filter(u => String(u._id) !== String(user._id)).slice(0, 6).map(mapUserToTeammate);
    }
    return scored;
  }, [users, user]);

  // helper to map backend user to the UI teammate shape used in your dashboard snippet
  function mapUserToTeammate(u) {
    return {
      id: u._id,
      name: u.name || 'Unknown',
      skills: Array.isArray(u.skills) ? u.skills : (u.skills ? String(u.skills).split(',').map(s => s.trim()) : []),
      experience: u.experience || '',
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || u._id)}`,
      title: u.title || u.bio || '',
      preferredRoles: Array.isArray(u.preferredRoles) ? u.preferredRoles : [],
      availability: u.availability || 'Available',
      bio: u.bio || '',
    };
  }

  const formatDate = (d) => {
    try {
      if (!d) return 'TBD';
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  };

  // guards & loading UI
  if (loading || fetchingHackathons || fetchingUsers || hackathons === null || users === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard…</div>
      </div>
    );
  }

  if (!user) return null; // redirect already handled by useEffect

  return (
    <>
      <Helmet>
        <title>Dashboard - SyncUp</title>
        <meta name="description" content="Your personalized SyncUp dashboard with hackathons, team matching, and AI coaching insights." />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="gradient-text">{user.name}</span>! 👋
            </h1>
            <p className="text-gray-400 text-lg">Ready to build something amazing? Let's find your next hackathon adventure.</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main Dashboard Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Tabs defaultValue="hackathons" className="space-y-6">
              <TabsList className="glass-card p-1 bg-white/5 border border-white/10">
                <TabsTrigger value="hackathons" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Hackathon Explorer
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">
                  <Crown className="h-4 w-4 mr-2" />
                  My Team
                </TabsTrigger>
                <TabsTrigger value="matchmaking" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  <Users className="h-4 w-4 mr-2" />
                  Team Matchmaking
                </TabsTrigger>
                <TabsTrigger value="ai-coach" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Coach
                </TabsTrigger>
                <TabsTrigger value="test" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                  🧪 Test
                </TabsTrigger>
              </TabsList>

              {/* Hackathon Explorer Tab (uses upcomingHackathons) */}
              <TabsContent value="hackathons" className="space-y-6">
                {/* My Joined Hackathons Section */}
                {teamData && teamData.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-white">My Hackathons</h2>
                      <Button onClick={() => navigate('/my-teams')} variant="outline" className="border-white/20">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teamData.map((item) => (
                        <div key={item.hackathon._id} className="glass-card p-6 rounded-xl border-2 border-green-500/30">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-600/20">
                              <Trophy className="h-5 w-5 text-green-400" />
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              item.role === 'leader' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : item.role === 'member'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {item.role === 'leader' ? '👑 LEADER' : item.role === 'member' ? 'MEMBER' : 'SOLO'}
                            </span>
                          </div>

                          <h3 className="text-lg font-semibold text-white mb-2">{item.hackathon.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">{formatDate(item.hackathon.date)}</p>
                          
                          {item.team && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400">Team: <span className="text-white font-medium">{item.team.name}</span></p>
                              <p className="text-xs text-gray-500">{item.team.members?.length || 0}/{item.team.maxMembers || 5} members</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => navigate(`/hackathon/${item.hackathon._id}`)} 
                              className="flex-1 glass-button"
                              size="sm"
                            >
                              View
                            </Button>
                            {item.team && (
                              <Button 
                                onClick={() => navigate(`/projects/${item.hackathon._id}`)} 
                                variant="outline"
                                className="flex-1 border-white/20"
                                size="sm"
                              >
                                Project
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Upcoming Hackathons</h2>
                  <Button onClick={() => navigate('/explorer')} className="glass-button">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>

                {hackathonsError ? (
                  <div className="text-red-400">Error loading hackathons: {hackathonsError}</div>
                ) : upcomingHackathons.length === 0 ? (
                  <div className="text-gray-400">No upcoming hackathons found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingHackathons.slice(0, 6).map((hackathon) => (
                      <div key={hackathon._id || hackathon.id} className="hackathon-card p-6 rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                            <Trophy className="h-5 w-5 text-blue-400" />
                          </div>
                          <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">{hackathon.theme || 'General'}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">{hackathon.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{formatDate(hackathon.date)}</p>

                        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                          <span>
                            {Array.isArray(hackathon.participants) 
                              ? hackathon.participants.map(p => p.name).join(', ')
                              : '—'}
                          </span>
                          <span className="text-green-400 font-semibold">{hackathon.prize ?? '—'}</span>
                        </div>

                        <Button onClick={() => navigate(`/hackathons/${hackathon._id || hackathon.id}`)} className="w-full glass-button">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* My Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">My Teams</h2>
                  <Button onClick={() => navigate('/my-teams')} className="glass-button">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {loadingTeam ? (
                  <div className="text-gray-400">Loading your teams...</div>
                ) : !teamData || teamData.length === 0 ? (
                  <div className="glass-card p-12 rounded-xl text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Teams Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Join a hackathon and create or join a team to get started!
                    </p>
                    <Button onClick={() => navigate('/explorer')} className="glass-button">
                      Browse Hackathons
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teamData.map((item) => (
                      <div key={item.hackathon._id} className="glass-card p-6 rounded-xl">
                        {/* Hackathon Header */}
                        <div className="mb-4 pb-4 border-b border-white/10">
                          <h3 className="text-lg font-bold text-white mb-1">{item.hackathon.name}</h3>
                          <p className="text-sm text-gray-400">{formatDate(item.hackathon.date)}</p>
                        </div>

                        {/* Team Info */}
                        {item.team ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-400" />
                                <span className="text-white font-semibold">{item.team.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                item.role === 'leader' 
                                  ? 'bg-yellow-500/20 text-yellow-400' 
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {item.role === 'leader' ? '👑 LEADER' : 'MEMBER'}
                              </span>
                            </div>

                            {/* Team Members */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-400 mb-2">
                                {item.team.members?.length || 0}/{item.team.maxMembers || 5} Members
                              </p>
                              <div className="flex -space-x-2">
                                {item.team.members?.slice(0, 5).map((member, idx) => (
                                  <div
                                    key={member._id || idx}
                                    className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800"
                                    title={member.name}
                                  >
                                    {member.name?.charAt(0) || '?'}
                                  </div>
                                ))}
                                {item.team.members?.length > 5 && (
                                  <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                                    +{item.team.members.length - 5}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Invite Code */}
                            {item.role === 'leader' && item.team.inviteCode && (
                              <div className="mb-4 p-2 bg-white/5 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Invite Code:</p>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm text-blue-400 font-mono">{item.team.inviteCode}</code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.team.inviteCode);
                                      toast({ title: 'Copied!', description: 'Invite code copied to clipboard' });
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => navigate(`/hackathon/${item.hackathon._id}`)} 
                                variant="outline"
                                className="flex-1 border-white/20"
                                size="sm"
                              >
                                Manage Team
                              </Button>
                              <Button 
                                onClick={() => navigate(`/projects/${item.hackathon._id}`)} 
                                className="flex-1 glass-button"
                                size="sm"
                              >
                                Project Room
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-400 text-sm mb-3">Solo Participant</p>
                            <Button 
                              onClick={() => navigate(`/hackathon/${item.hackathon._id}`)} 
                              className="glass-button"
                              size="sm"
                            >
                              Create or Join Team
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Team Matchmaking Tab (uses suggestedTeammates) */}
              <TabsContent value="matchmaking" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Suggested Teammates</h2>
                  <Button onClick={() => navigate('/matchmaking')} className="glass-button">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>

                {usersError ? (
                  <div className="text-red-400">Error loading users: {usersError}</div>
                ) : suggestedTeammates.length === 0 ? (
                  <div className="text-gray-400">No suggested teammates found. Make sure your profile lists skills to match against.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestedTeammates.map((t) => (
                      <div key={t.id} className="teammate-card p-6 rounded-xl">
                        <div className="flex items-center mb-4">
                          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                            <p className="text-gray-400 text-sm">{t.experience}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(t.skills || []).slice(0, 6).map(skill => (
                            <span key={skill} className="skill-chip px-2 py-1 rounded-full text-xs">{skill}</span>
                          ))}
                        </div>

                        <Button onClick={() => toast({ title: 'Connect', description: `Send connection request to ${t.name}` })} className="w-full glass-button">Connect</Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* AI Coach Tab */}
              <TabsContent value="ai-coach" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">AI Coach Insights</h2>
                  <Button onClick={() => navigate('/ai-coach')} className="glass-button">Open Chat <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>

                <div className="glass-card p-8 rounded-xl">
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-gradient-to-r from-green-500/20 to-teal-600/20 w-fit mx-auto mb-4">
                      <Brain className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Coaching?</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">Get personalized advice on project ideas, team dynamics, and winning strategies from our AI coach.</p>
                    <Button onClick={() => navigate('/ai-coach')} className="glass-button">Start Coaching Session</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Test Tab */}
              <TabsContent value="test" className="space-y-6">
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-bold text-white mb-4">Test Multiple Hackathons Feature</h2>
                  <TestMultipleHackathons />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

