# Team Logic Test Scenarios

## Test Setup
- Create 3 test users: Alice, Bob, Charlie
- Create 1 test hackathon

## Scenario 1: Basic Team Creation
1. Alice registers for hackathon → `role: "solo"`
2. Alice creates team "Team Alpha" → `role: "leader"`
3. ✅ Verify: Alice is leader, team has 1 member

## Scenario 2: Join Team via Invite Code
1. Bob registers for hackathon → `role: "solo"`
2. Bob gets invite code from Alice
3. Bob joins Team Alpha → `role: "member"`
4. ✅ Verify: Bob is member, team has 2 members

## Scenario 3: Leader Cannot Leave Directly
1. Alice tries to leave Team Alpha
2. ❌ Expected Error: "As a leader, you must transfer leadership or delete the team before leaving"

## Scenario 4: Member Can Leave
1. Bob leaves Team Alpha → `role: "solo"`
2. ✅ Verify: Bob is solo, team has 1 member (Alice)

## Scenario 5: Transfer Leadership
1. Bob rejoins Team Alpha
2. Alice transfers leadership to Bob
3. ✅ Verify: Bob is leader, Alice is member

## Scenario 6: Former Leader Can Now Leave
1. Alice (now member) leaves Team Alpha → `role: "solo"`
2. ✅ Verify: Alice is solo, team has 1 member (Bob)

## Scenario 7: Cannot Create Team While in Team
1. Alice rejoins Team Alpha as member
2. Alice tries to create "Team Beta"
3. ❌ Expected Error: "You are already in a team. Leave your current team first."

## Scenario 8: Cannot Join Another Team While in Team
1. Charlie registers and creates "Team Gamma"
2. Alice (in Team Alpha) tries to join Team Gamma
3. ❌ Expected Error: "You are already in a team. Leave your current team first."

## Scenario 9: Leader Deletes Team
1. Bob deletes Team Alpha
2. ✅ Verify: Bob is solo, Alice is solo, team is deleted

## Scenario 10: Remove Member
1. Alice creates Team Alpha
2. Bob joins Team Alpha
3. Alice removes Bob from team
4. ✅ Verify: Bob is solo, team has 1 member (Alice)

## Scenario 11: Team Capacity Limit
1. Alice creates Team Alpha (maxMembers: 3)
2. Bob joins → team has 2 members
3. Charlie joins → team has 3 members
4. Dave tries to join
5. ❌ Expected Error: "Team is full"

## Scenario 12: Invalid Invite Code
1. Bob tries to join with code "INVALID123"
2. ❌ Expected Error: "Team not found"

## Scenario 13: Transfer to Non-Member
1. Alice is leader of Team Alpha
2. Alice tries to transfer leadership to Charlie (not in team)
3. ❌ Expected Error: "New leader must be a member of the team"

## Scenario 14: Leader Wants to Join Another Team
### Path A: Delete Team First
1. Alice is leader of Team Alpha
2. Alice deletes Team Alpha → `role: "solo"`
3. Alice joins Team Gamma → `role: "member"`
4. ✅ Success

### Path B: Transfer Then Leave
1. Bob is leader of Team Beta with Charlie as member
2. Bob transfers leadership to Charlie
3. Bob leaves Team Beta → `role: "solo"`
4. Bob joins Team Gamma → `role: "member"`
5. ✅ Success

## API Testing Commands

### Register for Hackathon
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/register \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Create Team
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/team/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"teamName": "Team Alpha", "maxMembers": 5}'
```

### Join Team
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/team/join \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode": "ABC123XY"}'
```

### Leave Team
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/team/leave \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Remove Member
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/team/remove-member \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"memberId": "{userId}"}'
```

### Transfer Leadership
```bash
curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/team/transfer-leadership \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"newLeaderId": "{userId}"}'
```

### Delete Team
```bash
curl -X DELETE http://localhost:5000/api/hackathons/{hackathonId}/team/delete \
  -H "Authorization: Bearer {token}"
```

### Get My Registration
```bash
curl -X GET http://localhost:5000/api/hackathons/{hackathonId}/my-registration \
  -H "Authorization: Bearer {token}"
```

### Get All Teams
```bash
curl -X GET http://localhost:5000/api/hackathons/{hackathonId}/teams
```
