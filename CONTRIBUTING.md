# Contributing to SyncUp

Thank you for your interest in contributing to SyncUp! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in Issues
2. Create a new issue with a clear title and description
3. Include steps to reproduce the bug
4. Add screenshots if applicable
5. Specify your environment (OS, browser, Node version)

### Suggesting Features
1. Check if the feature has been suggested
2. Create a new issue with the "enhancement" label
3. Describe the feature and its benefits
4. Explain how it would work

### Pull Requests
1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

### Testing
- Test your changes locally
- Ensure all existing tests pass
- Add tests for new features
- Test on multiple browsers if frontend changes

## 🏗️ Project Structure

```
syncup-platform/
├── src/              # Frontend React code
├── backend/          # Node.js backend
├── python_agent_service/  # AI services
└── docs/             # Documentation
```

### Frontend Development
- Use React hooks
- Follow component structure
- Use Tailwind CSS for styling
- Implement responsive design

### Backend Development
- Follow RESTful API conventions
- Use async/await for asynchronous code
- Implement proper error handling
- Add input validation

### AI Services
- Document AI prompts clearly
- Test with various inputs
- Handle API failures gracefully
- Optimize for response time

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# Python tests
cd python_agent_service && pytest
```

### Manual Testing
1. Test user flows end-to-end
2. Check responsive design
3. Verify API responses
4. Test error scenarios

## 📚 Documentation

- Update README.md for major changes
- Add JSDoc comments for functions
- Update API documentation
- Include examples in code

## 🔍 Code Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PRs focused and small
4. Update PR description if scope changes

## 🎯 Priority Areas

We especially welcome contributions in:
- Bug fixes
- Performance improvements
- Documentation improvements
- Test coverage
- Accessibility enhancements
- UI/UX improvements

## ❓ Questions?

Feel free to:
- Open an issue for discussion
- Join our Discord community
- Email us at contribute@syncup.ai

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing to SyncUp! 🎉