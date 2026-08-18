# AI SDLC Agent - Automated Software Development Lifecycle

An intelligent GitHub Actions workflow that uses NVIDIA AI Foundation models to automatically implement features, fix bugs, resolve security issues, optimize performance, refactor code, and manage dependencies.

## 🚀 Quick Start

### Prerequisites

1. **NVIDIA API Key**: Get your API key from [build.nvidia.com](https://build.nvidia.com)
2. **GitHub Repository**: With Actions enabled
3. **Supported Project Type**: Node.js, Python, Go, Java (Maven/Gradle), Rust, .NET, or Docker

### Installation

1. **Copy the workflow files** to your repository:
   ```
   .github/
   ├── workflows/
   │   └── ai-sdlc-agent.yml
   ├── prompts/
   │   ├── feature_prompt.md
   │   ├── bugfix_prompt.md
   │   ├── security_prompt.md
   │   ├── dependabot_prompt.md
   │   ├── performance_prompt.md
   │   └── refactor_prompt.md
   ├── ai-agent-config.yml
   └── dependabot.yml
   ```

2. **Add NVIDIA API Key as GitHub Secret**:
   - Go to Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NVIDIA_API_KEY`
   - Value: Your NVIDIA API key from build.nvidia.com

3. **Enable Dependabot** (optional but recommended):
   - Go to Repository → Settings → Security & analysis
   - Enable "Dependabot alerts" and "Dependabot security updates"

## 📖 Usage

### Automatic Triggers

| Trigger | Action |
|---------|--------|
| **Issue labeled `enhancement`** | Creates feature implementation PR |
| **Issue labeled `bug`** | Creates bug fix PR |
| **Issue labeled `security`** | Creates security fix PR |
| **Issue labeled `performance`** | Creates optimization PR |
| **Issue labeled `refactor`** | Creates refactoring PR |
| **Dependabot PR opened** | Analyzes and creates updated implementation PR |

### Manual Trigger

Go to **Actions → AI SDLC Agent → Run workflow** and provide:

- **Task Type**: `feature`, `bugfix`, `security`, `performance`, `refactor`, `dependabot`
- **Prompt**: Detailed description of the task
- **Model** (optional): Override default model selection

### Example Issue for Feature

```markdown
Title: Add user authentication endpoint

Labels: enhancement

Body:
## Requirements
- POST /api/auth/login with email/password
- POST /api/auth/register with validation
- JWT token response with 24h expiry
- Rate limiting: 5 attempts/minute
- Secure password hashing (bcrypt)

## Acceptance Criteria
- Returns 401 for invalid credentials
- Returns 429 for rate limit exceeded
- Tokens validated on protected routes
- Integration tests included
```

## ⚙️ Configuration

### Model Selection

The agent automatically selects models based on task type:

| Task Type | Default Model | Use Case |
|-----------|---------------|----------|
| Feature | `meta/llama-3.1-70b-instruct` | General development |
| Bug Fix | `meta/llama-3.1-70b-instruct` | Debugging & fixing |
| Security | `nvidia/llama-3.1-nemotron-70b-instruct` | Vulnerability analysis |
| Performance | `meta/llama-3.1-405b-instruct` | Complex optimization |
| Refactor | `meta/llama-3.1-70b-instruct` | Code restructuring |
| Dependabot | `meta/llama-3.1-70b-instruct` | Dependency updates |

Override in `.github/ai-agent-config.yml`:

```yaml
models:
  default: "meta/llama-3.1-70b-instruct"
  security: "nvidia/llama-3.1-nemotron-70b-instruct"
  performance: "meta/llama-3.1-405b-instruct"
```

### Customizing Prompts

Edit files in `.github/prompts/` to customize behavior:

- Add project-specific conventions
- Include architecture guidelines
- Define coding standards
- Add framework-specific patterns

### Testing Framework Detection

The agent auto-detects and runs tests for:

| Language | Detection Files | Test Command |
|----------|-----------------|--------------|
| Node.js | `package.json` | `npm test` |
| Python | `pyproject.toml`, `requirements.txt` | `pytest` |
| Go | `go.mod` | `go test ./...` |
| Maven | `pom.xml` | `mvn test` |
| Gradle | `build.gradle` | `./gradlew test` |

Add custom test commands in `.github/ai-agent-config.yml`:

```yaml
testing:
  frameworks:
    node:
      test: "npm run test:ci"
      lint: "npm run lint:ci"
```

## 🔒 Security Features

### Built-in Protections

- **Prompt Sanitization**: Rejects prompts > 10,000 chars, detects dangerous commands
- **Sensitive File Protection**: Blocks modifications to `.env`, `*.pem`, `*.key`, secrets files
- **Secret Scanning**: Detects passwords, tokens, API keys in diffs
- **Loop Prevention**: Ignores `ai-agent-*` branches and bot authors
- **Least Privilege**: Minimal GitHub permissions (contents, PRs, issues)

### Security Checklist for PRs

The agent verifies:
- [ ] No sensitive files modified
- [ ] No secrets in code changes
- [ ] All tests pass
- [ ] Security headers present (for web apps)
- [ ] Input validation on all endpoints
- [ ] Dependencies scanned for CVEs

## 📁 Project Structure

```
.github/
├── workflows/
│   └── ai-sdlc-agent.yml          # Main workflow
├── prompts/
│   ├── feature_prompt.md          # Feature implementation template
│   ├── bugfix_prompt.md           # Bug fix template
│   ├── security_prompt.md         # Security fix template
│   ├── dependabot_prompt.md       # Dependency update template
│   ├── performance_prompt.md      # Performance optimization template
│   └── refactor_prompt.md         # Refactoring template
├── ai-agent-config.yml            # Agent configuration
└── dependabot.yml                 # Dependabot configuration
```

## 🛠️ Customization Guide

### Adding New Project Types

1. Add detection logic in `ai-agent-config.yml`
2. Create test commands for the ecosystem
3. Add language-specific security patterns

### Modifying PR Templates

Edit the PR generation section in `ai-sdlc-agent.yml`:

```yaml
- name: Generate PR title and body
  run: |
    # Customize PR_TITLE and PR_BODY format
    PR_TITLE="${PREFIX}: ${SHORT_PROMPT}..."
```

### Adding Custom Labels

Update labels in `ai-agent-config.yml`:

```yaml
github:
  pr:
    labels:
      ai-generated: "ai-generated"
      feature: "enhancement"
      # Add custom labels
      urgent: "priority:urgent"
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Aider fails with API error** | Check `NVIDIA_API_KEY` secret is valid and has quota |
| **Tests fail after AI changes** | Review generated code, add missing test setup in prompt |
| **PR not created** | Verify `GITHUB_TOKEN` permissions include `pull-requests: write` |
| **Sensitive file error** | Add file to `.gitignore`, don't commit secrets |
| **Dependabot PR not processed** | Check Dependabot is enabled and PR has correct labels |

### Debugging Workflow

1. Check **Actions** tab for workflow run logs
2. Look for `🔍`, `⚠️`, `❌`, `✅` emoji markers in logs
3. Review Aider output in `/tmp/aider_output.log` (in workflow)
4. Check git diff: `git diff HEAD~1 HEAD`

### Manual Aider Test

```bash
# Install locally
pip install aider-chat

# Set API key
export OPENAI_API_KEY=your_nvidia_key
export OPENAI_API_BASE=https://integrate.api.nvidia.com/v1

# Run with prompt
aider --message "Add login endpoint" --model meta/llama-3.1-70b-instruct --auto-commits --yes
```

## 📊 Monitoring & Metrics

Track agent effectiveness:

- **PR Merge Rate**: % of AI PRs merged without major changes
- **Test Pass Rate**: % of AI PRs passing all tests
- **Time to Merge**: Average time from creation to merge
- **Security Issues**: Vulnerabilities caught vs missed

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2024 | Complete rewrite with NVIDIA API, specialized prompts, security hardening |
| 1.0.0 | 2023 | Initial release with basic feature/bugfix support |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with your project
4. Submit PR with improvements

## 📄 License

MIT License - See LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues for bug reports and feature requests
- **Documentation**: This README and inline workflow comments
- **NVIDIA API**: [NVIDIA AI Foundation Docs](https://docs.nvidia.com/ai-foundation/)

---

**Built with ❤️ using NVIDIA AI Foundation Models and GitHub Actions**