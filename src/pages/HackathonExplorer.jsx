// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Helmet } from 'react-helmet';
// import { Search, Filter, Calendar, MapPin, Users, Trophy, Heart, Bookmark } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { toast } from '@/components/ui/use-toast';

// const HackathonExplorer = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [savedHackathons, setSavedHackathons] = useState(new Set());

//   const hackathons = [
//     {
//       id: 1,
//       name: 'AI Innovation Challenge 2024',
//       date: '2024-03-15',
//       endDate: '2024-03-17',
//       location: 'San Francisco, CA',
//       type: 'In-Person',
//       theme: 'Artificial Intelligence',
//       participants: 1200,
//       prize: '$50,000',
//       difficulty: 'Advanced',
//       description: 'Build the next generation of AI applications that solve real-world problems.',
//       organizer: 'TechCorp',
//       tags: ['AI', 'Machine Learning', 'Innovation']
//     },
//     {
//       id: 2,
//       name: 'Green Tech Hackathon',
//       date: '2024-03-22',
//       endDate: '2024-03-24',
//       location: 'Online',
//       type: 'Virtual',
//       theme: 'Sustainability',
//       participants: 800,
//       prize: '$25,000',
//       difficulty: 'Intermediate',
//       description: 'Create sustainable technology solutions for environmental challenges.',
//       organizer: 'EcoTech Foundation',
//       tags: ['Sustainability', 'Environment', 'Clean Tech']
//     },
//     {
//       id: 3,
//       name: 'FinTech Revolution',
//       date: '2024-04-05',
//       endDate: '2024-04-07',
//       location: 'New York, NY',
//       type: 'Hybrid',
//       theme: 'Financial Technology',
//       participants: 1500,
//       prize: '$75,000',
//       difficulty: 'Advanced',
//       description: 'Revolutionize the financial industry with cutting-edge technology.',
//       organizer: 'FinanceHub',
//       tags: ['FinTech', 'Blockchain', 'Banking']
//     },
//     {
//       id: 4,
//       name: 'Healthcare Innovation Lab',
//       date: '2024-04-12',
//       endDate: '2024-04-14',
//       location: 'Boston, MA',
//       type: 'In-Person',
//       theme: 'Healthcare',
//       participants: 600,
//       prize: '$40,000',
//       difficulty: 'Intermediate',
//       description: 'Develop innovative healthcare solutions using modern technology.',
//       organizer: 'MedTech Alliance',
//       tags: ['Healthcare', 'Medical', 'Innovation']
//     },
//     {
//       id: 5,
//       name: 'Gaming & VR Expo Hack',
//       date: '2024-04-20',
//       endDate: '2024-04-22',
//       location: 'Los Angeles, CA',
//       type: 'In-Person',
//       theme: 'Gaming & VR',
//       participants: 900,
//       prize: '$35,000',
//       difficulty: 'Beginner',
//       description: 'Create immersive gaming and VR experiences for the future.',
//       organizer: 'GameDev Studios',
//       tags: ['Gaming', 'VR', 'Entertainment']
//     },
//     {
//       id: 6,
//       name: 'EdTech Future Summit',
//       date: '2024-05-01',
//       endDate: '2024-05-03',
//       location: 'Online',
//       type: 'Virtual',
//       theme: 'Education Technology',
//       participants: 700,
//       prize: '$30,000',
//       difficulty: 'Intermediate',
//       description: 'Transform education through innovative technology solutions.',
//       organizer: 'EduInnovate',
//       tags: ['EdTech', 'Education', 'Learning']
//     }
//   ];

//   const filters = [
//     { id: 'all', label: 'All Hackathons' },
//     { id: 'virtual', label: 'Virtual' },
//     { id: 'in-person', label: 'In-Person' },
//     { id: 'hybrid', label: 'Hybrid' },
//     { id: 'beginner', label: 'Beginner' },
//     { id: 'intermediate', label: 'Intermediate' },
//     { id: 'advanced', label: 'Advanced' }
//   ];

//   const filteredHackathons = hackathons.filter(hackathon => {
//     const matchesSearch = hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          hackathon.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          hackathon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     const matchesFilter = selectedFilter === 'all' || 
//                          hackathon.type.toLowerCase() === selectedFilter ||
//                          hackathon.difficulty.toLowerCase() === selectedFilter;
    
//     return matchesSearch && matchesFilter;
//   });

//   const handleSaveHackathon = (hackathonId) => {
//     const newSaved = new Set(savedHackathons);
//     if (newSaved.has(hackathonId)) {
//       newSaved.delete(hackathonId);
//       toast({
//         title: "Removed from saved",
//         description: "Hackathon removed from your saved list."
//       });
//     } else {
//       newSaved.add(hackathonId);
//       toast({
//         title: "Saved successfully!",
//         description: "Hackathon added to your saved list."
//       });
//     }
//     setSavedHackathons(newSaved);
//   };

//   // const handleJoinHackathon = (hackathon) => {
//   //   toast({
//   //     title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
//   //   });
//   // };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty.toLowerCase()) {
//       case 'beginner': return 'text-green-400 bg-green-500/20';
//       case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
//       case 'advanced': return 'text-red-400 bg-red-500/20';
//       default: return 'text-gray-400 bg-gray-500/20';
//     }
//   };

//   const getTypeColor = (type) => {
//     switch (type.toLowerCase()) {
//       case 'virtual': return 'text-blue-400 bg-blue-500/20';
//       case 'in-person': return 'text-purple-400 bg-purple-500/20';
//       case 'hybrid': return 'text-teal-400 bg-teal-500/20';
//       default: return 'text-gray-400 bg-gray-500/20';
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Hackathon Explorer - SyncUp</title>
//         <meta name="description" content="Discover amazing hackathons tailored to your interests and skill level. Join competitions and build innovative projects." />
//         <meta property="og:title" content="Hackathon Explorer - SyncUp" />
//         <meta property="og:description" content="Discover amazing hackathons tailored to your interests and skill level. Join competitions and build innovative projects." />
//       </Helmet>

//       <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               <span className="gradient-text">Discover Amazing Hackathons</span>
//             </h1>
//             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//               Find the perfect hackathon that matches your skills, interests, and schedule. Join thousands of developers building the future.
//             </p>
//           </motion.div>

//           {/* Search and Filters */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="glass-card p-6 rounded-2xl mb-8"
//           >
//             <div className="flex flex-col lg:flex-row gap-4">
//               {/* Search */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   placeholder="Search hackathons by name, theme, or tags..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 />
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap gap-2">
//                 {filters.map((filter) => (
//                   <button
//                     key={filter.id}
//                     onClick={() => setSelectedFilter(filter.id)}
//                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                       selectedFilter === filter.id
//                         ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
//                         : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
//                     }`}
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           {/* Results Count */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//             className="mb-6"
//           >
//             <p className="text-gray-400">
//               Showing {filteredHackathons.length} of {hackathons.length} hackathons
//             </p>
//           </motion.div>

//           {/* Hackathon Grid */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.3 }}
//             className="grid grid-cols-1 lg:grid-cols-2 gap-8"
//           >
//             {filteredHackathons.map((hackathon, index) => (
//               <motion.div
//                 key={hackathon.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.1 * index }}
//                 className="hackathon-card p-6 rounded-2xl"
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
//                       <Trophy className="h-6 w-6 text-blue-400" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-white">{hackathon.name}</h3>
//                       <p className="text-gray-400 text-sm">{hackathon.organizer}</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handleSaveHackathon(hackathon.id)}
//                     className="p-2 rounded-lg hover:bg-white/10 transition-colors"
//                   >
//                     <Bookmark 
//                       className={`h-5 w-5 ${
//                         savedHackathons.has(hackathon.id) 
//                           ? 'text-yellow-400 fill-current' 
//                           : 'text-gray-400'
//                       }`} 
//                     />
//                   </button>
//                 </div>

//                 {/* Tags */}
//                 <div className="flex items-center space-x-2 mb-4">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>
//                     {hackathon.difficulty}
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hackathon.type)}`}>
//                     {hackathon.type}
//                   </span>
//                   <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-500/20">
//                     {hackathon.theme}
//                   </span>
//                 </div>

//                 {/* Description */}
//                 <p className="text-gray-300 mb-4 leading-relaxed">
//                   {hackathon.description}
//                 </p>

//                 {/* Details */}
//                 <div className="space-y-3 mb-6">
//                   <div className="flex items-center text-gray-400 text-sm">
//                     <Calendar className="h-4 w-4 mr-2" />
//                     {new Date(hackathon.date).toLocaleDateString('en-US', { 
//                       month: 'long', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })} - {new Date(hackathon.endDate).toLocaleDateString('en-US', { 
//                       month: 'long', 
//                       day: 'numeric', 
//                       year: 'numeric' 
//                     })}
//                   </div>
//                   <div className="flex items-center text-gray-400 text-sm">
//                     <MapPin className="h-4 w-4 mr-2" />
//                     {hackathon.location}
//                   </div>
//                   <div className="flex items-center justify-between text-sm">
//                     <div className="flex items-center text-gray-400">
//                       <Users className="h-4 w-4 mr-2" />
//                       {hackathon.participants} participants
//                     </div>
//                     <div className="text-green-400 font-semibold">
//                       Prize: {hackathon.prize}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tags */}
//                 <div className="flex flex-wrap gap-2 mb-6">
//                   {hackathon.tags.map((tag) => (
//                     <span key={tag} className="skill-chip px-3 py-1 rounded-full text-xs">
//                       {tag}
//                     </span>
//                   ))}
//                 </div>

//                 {/* Actions */}
//                 <div className="flex space-x-3">
//                   <Button 
//                     // onClick={() => handleJoinHackathon(hackathon)}
//                     className="flex-1 glass-button"
//                   >
//                     Join Hackathon
//                   </Button>
//                   <Button 
//                     variant="outline" 
//                     // onClick={() => handleJoinHackathon(hackathon)}
//                     className="border-white/20 text-white hover:bg-white/10"
//                   >
//                     Learn More
//                   </Button>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>

//           {/* No Results */}
//           {filteredHackathons.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.6 }}
//               className="text-center py-12"
//             >
//               <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
//                 <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
//                 <p className="text-gray-400">
//                   Try adjusting your search terms or filters to find more hackathons.
//                 </p>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default HackathonExplorer;


// import { useAuth } from "@/contexts/AuthContext";


// // fe/src/pages/HackathonExplorer.jsx
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Helmet } from 'react-helmet';
// import { Search, Calendar, MapPin, Users, Trophy, Bookmark } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { toast } from '@/components/ui/use-toast';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// const { login, fetchProfile } = useAuth();

// const HackathonExplorer = () => {
//   const [hackathons, setHackathons] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [savedHackathons, setSavedHackathons] = useState(new Set());

//   useEffect(() => {
//     let mounted = true;
//     const fetchHackathons = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(`${API_BASE}/api/hackathons`);
//         if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
//         const data = await res.json();
//         if (!mounted) return;
//         setHackathons(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error('Fetch hackathons error', err);
//         setError(err.message || 'Failed to load hackathons');
//         toast({
//           title: 'Error fetching hackathons',
//           description: err.message || 'Check server logs',
//         });
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     fetchHackathons();
//     return () => { mounted = false; };
//   }, []);

//   const filters = [
//     { id: 'all', label: 'All Hackathons' },
//     { id: 'virtual', label: 'Virtual' },
//     { id: 'in-person', label: 'In-Person' },
//     { id: 'hybrid', label: 'Hybrid' },
//     { id: 'beginner', label: 'Beginner' },
//     { id: 'intermediate', label: 'Intermediate' },
//     { id: 'advanced', label: 'Advanced' }
//   ];

//   const getId = (h) => h._id || h.id;

//   const filteredHackathons = hackathons.filter(hackathon => {
//     const name = (hackathon.name || '').toString().toLowerCase();
//     const theme = (hackathon.theme || '').toString().toLowerCase();
//     const tags = (hackathon.tags || []).map(t => t.toString().toLowerCase());

//     const matchesSearch = !searchTerm ||
//       name.includes(searchTerm.toLowerCase()) ||
//       theme.includes(searchTerm.toLowerCase()) ||
//       tags.some(tag => tag.includes(searchTerm.toLowerCase()));

//     const hf = selectedFilter === 'all'
//       ? true
//       : (hackathon.type || '').toString().toLowerCase() === selectedFilter ||
//         (hackathon.difficulty || '').toString().toLowerCase() === selectedFilter;

//     return matchesSearch && hf;
//   });

//   const toggleSave = (hackathonId) => {
//     const newSaved = new Set(savedHackathons);
//     if (newSaved.has(hackathonId)) {
//       newSaved.delete(hackathonId);
//       toast({ title: 'Removed from saved', description: 'Hackathon removed from your saved list.' });
//     } else {
//       newSaved.add(hackathonId);
//       toast({ title: 'Saved successfully!', description: 'Hackathon added to your saved list.' });
//     }
//     setSavedHackathons(newSaved);
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch ((difficulty || '').toLowerCase()) {
//       case 'beginner': return 'text-green-400 bg-green-500/20';
//       case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
//       case 'advanced': return 'text-red-400 bg-red-500/20';
//       default: return 'text-gray-400 bg-gray-500/20';
//     }
//   };

//   const getTypeColor = (type) => {
//     switch ((type || '').toLowerCase()) {
//       case 'virtual': return 'text-blue-400 bg-blue-500/20';
//       case 'in-person': return 'text-purple-400 bg-purple-500/20';
//       case 'hybrid': return 'text-teal-400 bg-teal-500/20';
//       default: return 'text-gray-400 bg-gray-500/20';
//     }
//   };

//   // compute participants count (works with backend that returns array or number)
//   const participantsCount = (hackathon) => {
//     if (Array.isArray(hackathon.participants)) {
//       // participants currently stores team ids — this returns number of teams
//       return hackathon.participants.length;
//     }
//     if (typeof hackathon.participants === 'number') return hackathon.participants;
//     if (hackathon.participantsCount) return hackathon.participantsCount;
//     return 0;
//   };

//   // const handleJoinHackathon = async (hackathon) => {
//   //   // get token from localStorage (AuthContext stores token as "syncup_token")
//   //   const token = localStorage.getItem('syncup_token') || localStorage.getItem('token');
//   //   if (!token) {
//   //     toast({ title: 'Login required', description: 'Please log in to join a hackathon.' });
//   //     return;
//   //   }

//   //   // ask for a team name (optional) — a simple UX; you can replace with modal
//   //   const teamName = window.prompt('Enter a team name (leave blank to auto-create):') || undefined;

//   //   try {
//   //     const res = await fetch(`${API_BASE}/api/hackathons/${getId(hackathon)}/join`, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify({ teamName }),
//   //     });

//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data.message || 'Failed to join hackathon');

//   //     toast({ title: '🎉 Joined!', description: data.message || 'You have joined the hackathon.' });

//   //     // update the single hackathon locally (optimistic): fetch details again
//   //     // find index and replace by fresh fetch of that hackathon
//   //     const fresh = await fetch(`${API_BASE}/api/hackathons/${getId(hackathon)}`);
//   //     if (fresh.ok) {
//   //       const updated = await fresh.json();
//   //       setHackathons(prev => prev.map(h => (getId(h) === getId(updated) ? updated : h)));
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast({ title: 'Could not join', description: err.message || 'See console' });
//   //   }
//   // };
//   // inside HackathonExplorer.jsx (replace previous handleJoinHackathon)
// // const handleJoinHackathon = async (hackathon) => {
// //   const token = localStorage.getItem('syncup_token') || localStorage.getItem('token');
// //   if (!token) {
// //     toast({ title: 'Login required', description: 'Please log in to join a hackathon.' });
// //     return;
// //   }

// //   // Optimistic disable / indicate joining
// //   toast({ title: 'Joining...', description: `Joining ${hackathon.name} — please wait.` });

// //   try {
// //     const res = await fetch(`${API_BASE}/api/hackathons/${getId(hackathon)}/join`, {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         Authorization: `Bearer ${token}`,
// //       },
// //       // empty body => backend will auto-create a sensible teamName if needed
// //       body: JSON.stringify({})  
// //     });

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data.message || 'Failed to join');

// //     // Success toast
// //     toast({ title: 'Joined!', description: data.message || 'You have been added to a team.' });

// //     // If backend returned a team with _id, optionally redirect to a team page:
// //     if (data.team && (data.team._id || data.team.id)) {
// //       // OPTIONAL: redirect to team details page (uncomment if you have that route)
// //       // navigate(`/teams/${data.team._id || data.team.id}`);
// //     }

// //     // Refresh the single hackathon entry to have updated participants/teams
// //     try {
// //       const fresh = await fetch(`${API_BASE}/api/hackathons/${getId(hackathon)}`);
// //       if (fresh.ok) {
// //         const updated = await fresh.json();
// //         setHackathons(prev => prev.map(h => (getId(h) === getId(updated) ? updated : h)));
// //       } else {
// //         // Fallback: refetch entire list
// //         const all = await fetch(`${API_BASE}/api/hackathons`);
// //         if (all.ok) setHackathons(await all.json());
// //       }
// //     } catch (err) {
// //       console.warn('Could not refresh after join', err);
// //     }
// //   } catch (err) {
// //     console.error('Join failed', err);
// //     toast({ title: 'Join failed', description: err.message || 'Could not join' });
// //   }
// // };

// // const handleJoinHackathon = async (hackathon) => {
// //   const token =
// //     localStorage.getItem("syncup_token") || localStorage.getItem("token");

// //   if (!token) {
// //     toast({
// //       title: "Login required",
// //       description: "Please log in to join a hackathon.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   // Ask for team name (required in backend)
// //   const teamName = window.prompt("Enter a team name: (Required)");
// //   if (!teamName) {
// //     toast({
// //       title: "Team name required",
// //       description: "You must provide a team name to join.",
// //       variant: "destructive",
// //     });
// //     return;
// //   }

// //   try {
// //     const res = await fetch(
// //       `http://localhost:5000/api/hackathons/${hackathon._id}/join`,
// //       {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({ teamName }),
// //       }
// //     );

// //     const data = await res.json();
// //     if (!res.ok) throw new Error(data.message || "Failed to join hackathon");

// //     toast({
// //       title: "🎉 Joined!",
// //       description: `You successfully joined ${teamName}`,
// //     });

// //     // refresh the updated hackathon data (to update participants)
// //     const updatedRes = await fetch(
// //       `http://localhost:5000/api/hackathons/${hackathon._id}`
// //     );
// //     if (updatedRes.ok) {
// //       const updatedHackathon = await updatedRes.json();
// //       setHackathons((prev) =>
// //         prev.map((h) =>
// //           h._id === updatedHackathon._id ? updatedHackathon : h
// //         )
// //       );
// //     }
// //   } catch (err) {
// //     console.error("Join failed:", err);
// //     toast({
// //       title: "Join failed",
// //       description: err.message,
// //       variant: "destructive",
// //     });
// //   }
// // };

// const handleJoinHackathon = async (hackathon) => {
//   const token = localStorage.getItem("syncup_token") || localStorage.getItem("token");
//   if (!token) {
//     toast({ title: "Login required", description: "Please log in to join a hackathon.", variant: "destructive" });
//     return;
//   }

//   const teamName = window.prompt("Enter a team name: (Required)");
//   if (!teamName) {
//     toast({ title: "Team name required", description: "You must provide a team name to join.", variant: "destructive" });
//     return;
//   }

//   try {
//     const res = await fetch(`http://localhost:5000/api/hackathons/${hackathon._id}/join`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       body: JSON.stringify({ teamName }),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Failed to join");

//     toast({ title: "🎉 Joined!", description: data.message || `You joined ${hackathon.name}` });

//     // Option A: If backend returns updated user as `data.user`, use it directly:
//     if (data.user) {
//       // normalize the user object shape if needed then update context
//       const updatedUser = {
//         ...data.user,
//         // ensure fields required by your frontend exist
//       };
//       login(updatedUser); // updates AuthContext and localStorage (your login sets syncup_user, syncup_token)
//     } else {
//       // Option B: fetch profile explicitly and update AuthContext
//       const profileRes = await fetch("http://localhost:5000/api/users/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (profileRes.ok) {
//         const profile = await profileRes.json();
//         login(profile); // update local context and localStorage
//       } else {
//         // if profile not available, you can still choose to refetch users/hackathons or show a small toast
//         console.warn("Profile refresh failed after join");
//       }
//     }

//     // refresh hackathon list to update participants
//     try {
//       const updatedRes = await fetch(`http://localhost:5000/api/hackathons/${hackathon._id}`);
//       if (updatedRes.ok) {
//         const updatedHackathon = await updatedRes.json();
//         setHackathons(prev => prev.map(h => (h._id === updatedHackathon._id ? updatedHackathon : h)));
//       }
//     } catch (err) {
//       console.warn("Could not refresh hackathon after join", err);
//     }
//   } catch (err) {
//     console.error("Join failed:", err);
//     toast({ title: "Join failed", description: err.message || "Could not join", variant: "destructive" });
//   }
// };

//   return (
//     <>
//       <Helmet>
//         <title>Hackathon Explorer - SyncUp</title>
//         <meta name="description" content="Discover hackathons that match your skills" />
//       </Helmet>

//       <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
//         <div className="max-w-7xl mx-auto">
//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Discover Amazing Hackathons</span></h1>
//             <p className="text-xl text-gray-300 max-w-3xl mx-auto">Find hackathons that match your skills, join teams, and build projects.</p>
//           </motion.div>

//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card p-6 rounded-2xl mb-8">
//             <div className="flex flex-col lg:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   type="text"
//                   placeholder="Search hackathons by name, theme, or tags..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                 />
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {filters.map(filter => (
//                   <button
//                     key={filter.id}
//                     onClick={() => setSelectedFilter(filter.id)}
//                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === filter.id
//                       ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
//                       : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
//                     }`}
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </motion.div>

//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-6">
//             <p className="text-gray-400">
//               Showing {filteredHackathons.length} hackathons
//             </p>
//           </motion.div>

//           {loading ? (
//             <div className="text-center py-20 text-gray-400">Loading hackathons...</div>
//           ) : error ? (
//             <div className="text-center py-20 text-red-400">Failed to load hackathons: {error}</div>
//           ) : (
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {filteredHackathons.map((hackathon, index) => (
//                 <motion.div key={getId(hackathon)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }} className="hackathon-card p-6 rounded-2xl">
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-center space-x-3">
//                       <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
//                         <Trophy className="h-6 w-6 text-blue-400" />
//                       </div>
//                       <div>
//                         <h3 className="text-xl font-bold text-white">{hackathon.name}</h3>
//                         <p className="text-gray-400 text-sm">{hackathon.organizer}</p>
//                       </div>
//                     </div>
//                     <button onClick={() => toggleSave(getId(hackathon))} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
//                       <Bookmark className={`h-5 w-5 ${savedHackathons.has(getId(hackathon)) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
//                     </button>
//                   </div>

//                   <div className="flex items-center space-x-2 mb-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>{hackathon.difficulty}</span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hackathon.type)}`}>{hackathon.type}</span>
//                     <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-500/20">{hackathon.theme}</span>
//                   </div>

//                   <p className="text-gray-300 mb-4 leading-relaxed">{hackathon.description}</p>

//                   <div className="space-y-3 mb-6">
//                     <div className="flex items-center text-gray-400 text-sm">
//                       <Calendar className="h-4 w-4 mr-2" />
//                       {hackathon.date ? new Date(hackathon.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
//                       {' '} - {' '}
//                       {hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
//                     </div>
//                     <div className="flex items-center text-gray-400 text-sm">
//                       <MapPin className="h-4 w-4 mr-2" />
//                       {hackathon.location || 'Online'}
//                     </div>
//                     <div className="flex items-center justify-between text-sm">
//                       <div className="flex items-center text-gray-400">
//                         <Users className="h-4 w-4 mr-2" />
//                         {participantsCount(hackathon)} participants
//                       </div>
//                       <div className="text-green-400 font-semibold">Prize: {hackathon.prize || '—'}</div>
//                     </div>
//                   </div>

//                   <div className="flex flex-wrap gap-2 mb-6">
//                     {(hackathon.tags || []).map(tag => <span key={tag} className="skill-chip px-3 py-1 rounded-full text-xs">{tag}</span>)}
//                   </div>

//                   <div className="flex space-x-3">
//                     <Button onClick={() => handleJoinHackathon(hackathon)} className="flex-1 glass-button">Join Hackathon</Button>
//                     <Button variant="outline" onClick={() => window.open(`/hackathons/${getId(hackathon)}`, '_blank')} className="border-white/20 text-white hover:bg-white/10">Learn More</Button>
//                   </div>
//                 </motion.div>
//               ))}
//             </motion.div>
//           )}

//           {filteredHackathons.length === 0 && !loading && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center py-12">
//               <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
//                 <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
//                 <p className="text-gray-400">Try adjusting your search terms or filters to find more hackathons.</p>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default HackathonExplorer;

// fe/src/pages/HackathonExplorer.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, MapPin, Users, Trophy, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import JoinHackathonModal from "@/components/team/JoinHackathonModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HackathonExplorer = () => {
  const navigate = useNavigate();
  const { login, fetchProfile } = useAuth(); // ✅ hook INSIDE component
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [savedHackathons, setSavedHackathons] = useState(new Set());
  
  // Join modal state
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/hackathons`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setHackathons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch hackathons error", err);
        setError(err.message || "Failed to load hackathons");
        toast({
          title: "Error fetching hackathons",
          description: err.message || "Check server logs",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHackathons();
    return () => {
      mounted = false;
    };
  }, []);

  const filters = [
    { id: "all", label: "All Hackathons" },
    { id: "virtual", label: "Virtual" },
    { id: "in-person", label: "In-Person" },
    { id: "hybrid", label: "Hybrid" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  const getId = (h) => h._id || h.id;

  const filteredHackathons = hackathons.filter((hackathon) => {
    const name = (hackathon.name || "").toString().toLowerCase();
    const theme = (hackathon.theme || "").toString().toLowerCase();
    const tags = (hackathon.tags || []).map((t) => t.toString().toLowerCase());

    const matchesSearch =
      !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      theme.includes(searchTerm.toLowerCase()) ||
      tags.some((tag) => tag.includes(searchTerm.toLowerCase()));

    const hf =
      selectedFilter === "all"
        ? true
        : (hackathon.type || "").toString().toLowerCase() === selectedFilter ||
          (hackathon.difficulty || "").toString().toLowerCase() === selectedFilter;

    return matchesSearch && hf;
  });

  const toggleSave = (hackathonId) => {
    const newSaved = new Set(savedHackathons);
    if (newSaved.has(hackathonId)) {
      newSaved.delete(hackathonId);
      toast({ title: "Removed from saved", description: "Hackathon removed from your saved list." });
    } else {
      newSaved.add(hackathonId);
      toast({ title: "Saved successfully!", description: "Hackathon added to your saved list." });
    }
    setSavedHackathons(newSaved);
  };

  const getDifficultyColor = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "beginner":
        return "text-green-400 bg-green-500/20";
      case "intermediate":
        return "text-yellow-400 bg-yellow-500/20";
      case "advanced":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getTypeColor = (type) => {
    switch ((type || "").toLowerCase()) {
      case "virtual":
        return "text-blue-400 bg-blue-500/20";
      case "in-person":
        return "text-purple-400 bg-purple-500/20";
      case "hybrid":
        return "text-teal-400 bg-teal-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const participantsCount = (hackathon) => {
    if (Array.isArray(hackathon.participants)) return hackathon.participants.length;
    if (typeof hackathon.participants === "number") return hackathon.participants;
    if (hackathon.participantsCount) return hackathon.participantsCount;
    return 0;
  };

  const handleJoinHackathonClick = (hackathon) => {
    setSelectedHackathon(hackathon);
    setJoinModalOpen(true);
  };

  const handleJoinSuccess = (response) => {
    // Refresh hackathon list to update participants
    const refreshHackathons = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/hackathons`);
        if (res.ok) {
          const data = await res.json();
          setHackathons(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Could not refresh hackathons after join', err);
      }
    };
    
    refreshHackathons();
  };

  const handleJoinHackathon = async (hackathon) => {
    const token = localStorage.getItem("syncup_token") || localStorage.getItem("token");
    if (!token) {
      toast({ title: "Login required", description: "Please log in to join a hackathon.", variant: "destructive" });
      return;
    }

    const teamName = window.prompt("Enter a team name: (Required)");
    if (!teamName) {
      toast({ title: "Team name required", description: "You must provide a team name to join.", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/hackathons/${hackathon._id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to join");

      toast({ title: "🎉 Joined!", description: data.message || `You joined ${hackathon.name}` });

      // Update AuthContext: prefer backend returned user, else fetch profile
      if (data.user) {
        // backend returned updated user
        login(data.user);
      } else if (fetchProfile) {
        await fetchProfile(token);
      }

      // Refresh hackathon details (update participants)
      try {
        const updatedRes = await fetch(`${API_BASE}/api/hackathons/${hackathon._id}`);
        if (updatedRes.ok) {
          const updatedHackathon = await updatedRes.json();
          setHackathons((prev) => prev.map((h) => (getId(h) === getId(updatedHackathon) ? updatedHackathon : h)));
        } else {
          // fallback: refetch all hackathons
          const all = await fetch(`${API_BASE}/api/hackathons`);
          if (all.ok) setHackathons(await all.json());
        }
      } catch (err) {
        console.warn("Could not refresh hackathon after join", err);
      }
    } catch (err) {
      console.error("Join failed:", err);
      toast({ title: "Join failed", description: err.message || "Could not join", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Hackathon Explorer - SyncUp</title>
        <meta name="description" content="Discover hackathons that match your skills" />
      </Helmet>

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Discover Amazing Hackathons</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Find hackathons that match your skills, join teams, and build projects.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search hackathons by name, theme, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedFilter === filter.id
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-6">
            <p className="text-gray-400">Showing {filteredHackathons.length} hackathons</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading hackathons...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">Failed to load hackathons: {error}</div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredHackathons.map((hackathon, index) => (
                <motion.div key={getId(hackathon)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 * index }} className="hackathon-card p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20">
                        <Trophy className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{hackathon.name}</h3>
                        <p className="text-gray-400 text-sm">{hackathon.organizer}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleSave(getId(hackathon))} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                      <Bookmark className={`h-5 w-5 ${savedHackathons.has(getId(hackathon)) ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(hackathon.difficulty)}`}>{hackathon.difficulty}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hackathon.type)}`}>{hackathon.type}</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-500/20">{hackathon.theme}</span>
                  </div>

                  <p className="text-gray-300 mb-4 leading-relaxed">{hackathon.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {hackathon.date ? new Date(hackathon.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD"}
                      {" "} - {" "}
                      {hackathon.endDate ? new Date(hackathon.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD"}
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {hackathon.location || "Online"}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        {participantsCount(hackathon)} participants
                      </div>
                      <div className="text-green-400 font-semibold">Prize: {hackathon.prize || "—"}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {(hackathon.tags || []).map((tag) => (
                      <span key={tag} className="skill-chip px-3 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={() => handleJoinHackathonClick(hackathon)} className="flex-1 glass-button">Join Hackathon</Button>
                    <Button variant="outline" onClick={() => navigate(`/hackathon/${getId(hackathon)}`)} className="border-white/20 text-white hover:bg-white/10">Learn More</Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {filteredHackathons.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center py-12">
              <div className="glass-card p-8 rounded-2xl max-w-md mx-auto">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No hackathons found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters to find more hackathons.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Join Hackathon Modal */}
      <JoinHackathonModal
        hackathon={selectedHackathon}
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setSelectedHackathon(null);
        }}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
};

export default HackathonExplorer;

