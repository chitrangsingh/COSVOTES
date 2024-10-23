function toggleMenu() {
    const navMenu = document.getElementById("nav-menu");
        navMenu.classList.toggle("show");
}
let participants = loadParticipants(); // Load participants from local storage
let hasVoted = false;
let editIndex = null; // Track which participant is being edited

const form = document.getElementById("participant-form");
const participantsList = document.getElementById("participants-list");
const leaderboard = document.getElementById("leaderboard");
const resetButton = document.getElementById("reset-button");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editNameInput = document.getElementById("edit-name");
const editCostumeInput = document.getElementById("edit-costume");
const closeButton = document.querySelector(".close-button");
const clearButton = document.getElementById("clear-button");

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const name = document.getElementById("name").value.trim();
	const costume = document.getElementById("costume").value.trim();
	const icon = document.getElementById("icon").value;
	const photoInput = document.getElementById("photo");

	let photoURL = null;
	if (photoInput.files[0]) {
		photoURL = await readImageFile(photoInput.files[0]);
	}

	const participant = {
		name,
		costume,
		icon,
		photo: photoURL, // Save the base64 or blob URL if available, otherwise null
		votes: 0
	};

	participants.push(participant);
	saveParticipants(); // Save to local storage

	// Clear the form inputs
	document.getElementById("name").value = "";
	document.getElementById("costume").value = "";
	document.getElementById("icon").value = "";
	document.getElementById("photo").value = "";

	updateParticipants();
	updateLeaderboard();
});

// Helper function to read the image as a base64 URL
function readImageFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

// Load participants from local storage
function loadParticipants() {
	const savedData = localStorage.getItem("participants");
	return savedData ? JSON.parse(savedData) : [];
}

// Save participants to local storage
function saveParticipants() {
	localStorage.setItem("participants", JSON.stringify(participants));
}

function updateParticipants() {
	participantsList.innerHTML = ""; // Clear the UI

	if (participants.length === 0) {
		participantsList.innerHTML = "<li>No participants added yet.</li>";
	} else {
		participants.forEach((participant, index) => {
			const li = document.createElement("li");
			li.classList.add("participant-item");

			const participantInfo = document.createElement("div");
			participantInfo.classList.add("participant-info");
			participantInfo.innerHTML = `${
				participant.icon ? participant.icon + " " : ""
			}${participant.name} - "${participant.costume}"`;

			if (participant.photo) {
				const participantImage = document.createElement("img");
				participantImage.src = participant.photo;
				participantImage.alt = `${participant.name}'s costume`;
				participantImage.style.maxWidth = "150px";
				participantImage.style.borderRadius = "10px";
				participantImage.style.marginTop = "10px";
				li.appendChild(participantImage);
			}

			const participantActions = document.createElement("div");
			participantActions.classList.add("participant-actions");
			participantActions.innerHTML = `
                <button class="vote-button" onclick="vote(${index})" ${
				hasVoted ? "disabled" : ""
			}>Vote 🎃</button>
                <button class="edit-button" onclick="openEditModal(${index})">Edit ✏️</button>
                <button class="delete-button" onclick="deleteParticipant(${index})">Delete ❌</button>
            `;

			li.appendChild(participantInfo);
			li.appendChild(participantActions);
			participantsList.appendChild(li);
		});
	}
}

// Handle voting
function vote(index) {
	if (!hasVoted) {
		participants[index].votes++;
		hasVoted = true;
		saveParticipants(); // Save to local storage
		updateParticipants();
		updateLeaderboard();
	}
}

// Edit a participant (with modal animations)
function openEditModal(index) {
	editIndex = index;
	editNameInput.value = participants[index].name;
	editCostumeInput.value = participants[index].costume;
	editModal.classList.add("active");
}

// Handle form submission for edits
editForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const newName = editNameInput.value.trim();
	const newCostume = editCostumeInput.value.trim();

	if (newName && newCostume && editIndex !== null) {
		participants[editIndex].name = newName;
		participants[editIndex].costume = newCostume;
		closeEditModal();
		saveParticipants(); // Save to local storage
		updateParticipants();
		updateLeaderboard();
	}
});

// Delete a participant
function deleteParticipant(index) {
	participants.splice(index, 1);
	saveParticipants(); // Save to local storage
	updateParticipants();
	updateLeaderboard();
}

// Close the edit modal with animation
function closeEditModal() {
	editModal.classList.remove("active");
	editIndex = null;
}

// Handle modal close button click
closeButton.addEventListener("click", closeEditModal);

// Close modal if user clicks outside the modal content
window.addEventListener("click", (event) => {
	if (event.target === editModal) {
		closeEditModal();
	}
});

function updateLeaderboard() {
	leaderboard.innerHTML = ""; // Clear the UI

	if (participants.length === 0) {
		leaderboard.innerHTML = "<li>No votes yet.</li>";
	} else {
		const sortedParticipants = [...participants].sort(
			(a, b) => b.votes - a.votes
		);

		sortedParticipants.forEach((participant, i) => {
			const li = document.createElement("li");
			li.innerHTML = `
                <div class="participant-info">
                    ${participant.icon ? participant.icon + " " : ""}${
				participant.name
			} - Votes: ${participant.votes}
                </div>
                ${
																	participant.photo
																		? `<img src="${participant.photo}" alt="${participant.name}'s costume" style="max-width: 100px; border-radius: 5px; margin-top: 5px;">`
																		: ""
																}
            `;

			if (i === 0) {
				li.style.backgroundColor = "#ff6600";
				li.style.fontWeight = "bold";
			}

			leaderboard.appendChild(li);
		});
	}
}

// Reset all votes
resetButton.addEventListener("click", () => {
	participants = participants.map((p) => ({ ...p, votes: 0 }));
	hasVoted = false;
	saveParticipants(); // Save to local storage
	updateParticipants();
	updateLeaderboard();
});

// Clear all participants
clearButton.addEventListener("click", () => {
	participants = [];
	localStorage.removeItem("participants");

	// Update the UI
	updateParticipants();
	updateLeaderboard();
});

// Initialize the page with saved data or test data
window.onload = () => {
	updateParticipants();
	updateLeaderboard();
};
