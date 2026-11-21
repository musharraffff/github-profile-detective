
import { useState } from "react";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchName = username.trim();

    if (!searchName) {
      setError("Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setError("");
    setProfile(null);
    setRepositories([]);

    try {
      const [profileResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(searchName)}`),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(searchName)}/repos?sort=updated&per_page=6`
        ),
      ]);

      if (profileResponse.status === 404) {
        throw new Error("GitHub user not found. Check the username.");
      }

      if (profileResponse.status === 403) {
        throw new Error("GitHub API rate limit reached. Please try again later.");
      }

      if (!profileResponse.ok || !reposResponse.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      const profileData = await profileResponse.json();
      const reposData = await reposResponse.json();

      setProfile(profileData);
      setRepositories(reposData);
    } catch (err) {
      setError(err.message || "Unable to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <nav className="navbar">
        <a href="/" className="logo">
          <span>Git</span>Detective
        </a>
        <span className="nav-label">Profile Finder</span>
      </nav>

      <section className="search-section">
        <div className="search-card">
          <h1>Find a GitHub Profile</h1>
          <p>Explore developers and their repositories.</p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>

        {loading && <p className="loading-message">Fetching profile...</p>}

        {profile && (
          <div className="results">
            <div className="profile-card">
              <img
                src={profile.avatar_url}
                alt={`${profile.login}'s avatar`}
                className="avatar"
              />

              <div className="profile-info">
                <h2>{profile.name || profile.login}</h2>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="username"
                >
                  @{profile.login}
                </a>

                {profile.bio && <p className="bio">{profile.bio}</p>}

                {profile.location && (
                  <p className="location">📍 {profile.location}</p>
                )}

                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-link"
                >
                  View GitHub Profile ↗
                </a>
              </div>
            </div>

            <div className="stats">
              <div className="stat-card">
                <strong>{profile.public_repos}</strong>
                <span>Repositories</span>
              </div>

              <div className="stat-card">
                <strong>{profile.followers}</strong>
                <span>Followers</span>
              </div>

              <div className="stat-card">
                <strong>{profile.following}</strong>
                <span>Following</span>
              </div>
            </div>

            <div className="repositories">
              <div className="section-heading">
                <h2>Recent Repositories</h2>
                <span>Latest 6</span>
              </div>

              {repositories.length === 0 ? (
                <p className="empty-message">
                  This user has no public repositories.
                </p>
              ) : (
                <div className="repo-list">
                  {repositories.map((repo) => (
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="repo-card"
                      key={repo.id}
                    >
                      <h3>{repo.name}</h3>

                      <p>
                        {repo.description || "No description available."}
                      </p>

                      <div className="repo-meta">
                        {repo.language && <span>{repo.language}</span>}
                        <span>★ {repo.stargazers_count}</span>
                        <span>⑂ {repo.forks_count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <span>GitDetective</span>
        <span>Powered by GitHub API</span>
      </footer>
    </main>
  );
}

export default App;
