"""
Agent Tools - Database access via Node.js API
These functions call the Node.js backend to get real MongoDB data
"""

import requests
import os
from typing import Dict, Any, List, Optional

# Node.js backend URL
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:5000")

class AgentTools:
    """Tools for AI agents to access real database data via Node.js API"""
    
    def __init__(self, node_api_url: str = NODE_API_URL):
        self.node_api_url = node_api_url
        self.base_url = f"{node_api_url}/api/agent-tools"
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get user profile from database
        
        Args:
            user_id: MongoDB user ID
            
        Returns:
            User profile data
        """
        try:
            response = requests.get(
                f"{self.base_url}/user/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("user", {})
            else:
                print(f"Error getting user profile: {response.status_code}")
                return {}
        except Exception as e:
            print(f"Error calling get_user_profile: {e}")
            return {}
    
    def get_user_connections(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get user's connections from database
        
        Args:
            user_id: MongoDB user ID
            
        Returns:
            List of connected users
        """
        try:
            response = requests.get(
                f"{self.base_url}/connections/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("connections", [])
            else:
                print(f"Error getting connections: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling get_user_connections: {e}")
            return []
    
    def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get user's projects from database
        
        Args:
            user_id: MongoDB user ID
            
        Returns:
            List of user projects
        """
        try:
            response = requests.get(
                f"{self.base_url}/projects/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("projects", [])
            else:
                print(f"Error getting projects: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling get_user_projects: {e}")
            return []
    
    def get_user_hackathons(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get user's hackathons from database
        
        Args:
            user_id: MongoDB user ID
            
        Returns:
            List of hackathons user participated in
        """
        try:
            response = requests.get(
                f"{self.base_url}/hackathons/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("hackathons", [])
            else:
                print(f"Error getting hackathons: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling get_user_hackathons: {e}")
            return []
    
    def get_user_skills(self, user_id: str) -> List[str]:
        """
        Get user's skills from database
        
        Args:
            user_id: MongoDB user ID
            
        Returns:
            List of user skills
        """
        try:
            response = requests.get(
                f"{self.base_url}/skills/{user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("skills", [])
            else:
                print(f"Error getting skills: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling get_user_skills: {e}")
            return []
    
    def get_all_users(self, skills: Optional[List[str]] = None, 
                     interests: Optional[List[str]] = None,
                     exclude_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all users from database with optional filters
        
        Args:
            skills: Filter by skills
            interests: Filter by interests
            exclude_id: Exclude specific user ID
            
        Returns:
            List of users
        """
        try:
            params = {}
            if skills:
                params["skills"] = ",".join(skills)
            if interests:
                params["interests"] = ",".join(interests)
            if exclude_id:
                params["excludeId"] = exclude_id
            
            response = requests.get(
                f"{self.base_url}/users",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("users", [])
            else:
                print(f"Error getting all users: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling get_all_users: {e}")
            return []
    
    def search_users(self, skills: Optional[List[str]] = None,
                    interests: Optional[List[str]] = None,
                    exclude_id: Optional[str] = None,
                    limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search users by skills or interests
        
        Args:
            skills: Skills to search for
            interests: Interests to search for
            exclude_id: Exclude specific user ID
            limit: Maximum number of results
            
        Returns:
            List of matching users
        """
        try:
            payload = {
                "skills": skills or [],
                "interests": interests or [],
                "excludeId": exclude_id,
                "limit": limit
            }
            
            response = requests.post(
                f"{self.base_url}/search-users",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("users", [])
            else:
                print(f"Error searching users: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error calling search_users: {e}")
            return []
    
    def find_teammates(self, user_id: str, required_skills: List[str]) -> List[Dict[str, Any]]:
        """
        Find potential teammates based on required skills
        
        Args:
            user_id: Current user ID
            required_skills: Skills needed in teammates
            
        Returns:
            List of potential teammates with match scores
        """
        try:
            # Get current user's skills
            user_skills = self.get_user_skills(user_id)
            
            # Search for users with complementary skills
            candidates = self.search_users(
                skills=required_skills,
                exclude_id=user_id,
                limit=20
            )
            
            # Calculate match scores
            teammates = []
            for candidate in candidates:
                candidate_skills = set(candidate.get("skills", []))
                required_set = set(required_skills)
                user_set = set(user_skills)
                
                # Skills that candidate has that user needs
                complement_skills = list(required_set - user_set & candidate_skills)
                
                # Match score based on complementary skills
                match_score = len(complement_skills) / len(required_set) if required_set else 0
                
                if match_score > 0:
                    teammates.append({
                        **candidate,
                        "match_score": round(match_score * 10, 2),  # Scale to 0-10
                        "complement_skills": complement_skills
                    })
            
            # Sort by match score
            teammates.sort(key=lambda x: x["match_score"], reverse=True)
            
            return teammates[:10]  # Return top 10
            
        except Exception as e:
            print(f"Error finding teammates: {e}")
            return []

# Global instance
agent_tools = AgentTools()
