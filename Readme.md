# Anime Advice Bot

![Anime Advice Bot]

## Introduction

Welcome to Anime Advice Bot! This Discord bot provides anime recommendations, the latest anime news, and more. It's designed to be friendly, futuristic, and anime-themed, making it a perfect addition to any anime lover's Discord server.

## Features

- **Anime Recommendations**: Get personalized anime recommendations based on your preferred genre.
- **Latest Anime News**: Stay updated with the latest news on upcoming anime.
- **Genre List**: Explore different anime genres available.
- **Help Command**: Get a list of all available commands.

## Getting Started

### Prerequisites

- Node.js
- Discord account
- GitHub account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/anime-advice-bot.git
   cd anime-advice-bot
2. **Install dependencies**:
   ```bash
   npm install
3. **Set up environment variables:**:
    Create a .env file in the root directory and add your Discord bot token and API base URL:
   ```bash
   BOT_TOKEN=your-discord-bot-token
   API_BASE_URL=http://localhost:5000
4. **Run the bot**:
   ```bash
   git clone https://github.com/yourusername/anime-advice-bot.git
   cd anime-advice-bot
   
 **Deployment**
The bot can be deployed using various cloud platforms. Here's how to deploy it on Render:

- Create a Render account.
- Connect your GitHub repository to Render.
- Create a new Web Service and select your repository.
- Set environment variables:
   ```bash
   BOT_TOKEN: Your Discord bot token.
- API_BASE_URL: The URL of your deployed API.
- Deploy the service.
   Commands:
   User Commands
   ```bash
   !recommend <genre>: Get an anime recommendation for the specified genre.
   !news: Get the latest upcoming anime news.
   !genres: List all available genres.
   !help: Display the help message with a list of commands.

Developer Instructions
To contribute to the development of Anime Advice Bot, follow these instructions:
1. **Fork the repository.**:
2. **Create a new branch:**:
    ```bash
    git checkout -b feature-branch
3. **Make your changes and commit them**:
   ```bash
    git add .
    git commit -m "Your commit message"
    ```
4. **Push to your branch**:
   ```bash
    git push origin feature-branch
4. **Create a pull request on GitHub.**

### API Endpoints
- `/api/recommend/:genre`
- **Description**: Fetches a random anime recommendation based on the specified genre.
- **Method**: GET.
- **Parameters**: `genre` (string) - The genre for the recommendation.
- **Response**: A JSON object with anime details.
- `/api/news`
- **Description**: Fetches the latest upcoming anime news.
- **Method**: GET.
- **Response**: A JSON array with news details.

### Contributing
We welcome contributions from the community! Please read our Contributing Guidelines to get started.

### License
This project is licensed under the MIT License. See the LICENSE file for details.

### Acknowledgements
- Discord.js for the Discord API library.
- Jikan API for the anime data.
- Render for hosting services.

**Project created by Adi B**
