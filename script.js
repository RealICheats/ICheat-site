document.getElementById('lookupRobloxBtn').addEventListener('click', async () => {
  const username = document.getElementById('robloxUsername').value.trim();
  if (!username) {
    alert('Enter a Roblox username!');
    return;
  }

  const resultDiv = document.getElementById('robloxResult');
  resultDiv.style.display = 'block';

  try {
    // Step 1: Get User ID from username (POST to usernames/users)
    const userResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });
    const userData = await userResponse.json();

    if (!userData.data || userData.data.length === 0) {
      document.getElementById('displayName').textContent = 'User not found';
      return;
    }

    const userId = userData.data[0].id;
    const displayName = userData.data[0].displayName || userData.data[0].name;
    const actualUsername = userData.data[0].name;

    // Step 2: Get full user details (including created date)
    const detailsResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const details = await detailsResponse.json();

    const joinDate = new Date(details.created).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Step 3: Get avatar thumbnail (headshot, 150x150 PNG)
    const avatarResponse = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`
    );
    const avatarData = await avatarResponse.json();

    let avatarUrl = '';
    if (avatarData.data && avatarData.data.length > 0 && avatarData.data[0].state === 'Completed') {
      avatarUrl = avatarData.data[0].imageUrl;
    } else {
      avatarUrl = 'https://via.placeholder.com/150?text=No+Avatar'; // Fallback
    }

    // Display results
    document.getElementById('displayName').textContent = displayName;
    document.getElementById('username').textContent = actualUsername;
    document.getElementById('joinDate').textContent = joinDate;
    const img = document.getElementById('avatarImg');
    img.src = avatarUrl;
    img.style.display = 'block';

  } catch (error) {
    console.error(error);
    document.getElementById('displayName').textContent = 'Error fetching data';
  }
});
