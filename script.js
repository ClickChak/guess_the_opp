document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  const submitButton = document.getElementById('submit-button');
  const balanceElement = document.getElementById('balance');
  const app = document.querySelector('.app');
  const betWithFriendSection = document.getElementById('bet-with-friend-section');
  const depositSection = document.getElementById('deposit-section');
  const withdrawSection = document.getElementById('withdraw-section');
  const bettingAmountInput = document.getElementById('betting-amount');
  const startBettingButton = document.getElementById('start-betting');
  const inputContainer = document.createElement('div'); // Parent container for input and buttons
  inputContainer.classList.add('input-container'); // Add CSS class for styling

  const multipliers = [
    { label: 'x2', factor: 2 },
    { label: 'x3', factor: 3 },
    { label: '/2', factor: 0.5 },
    { label: '/3', factor: 1 / 3 },
  ];

  multipliers.forEach(({ label, factor }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.classList.add('multiplier-button'); // Add CSS class for styling

    button.addEventListener('click', () => {
      const currentAmount = parseFloat(bettingAmountInput.value) || 0;
      const newAmount = Math.floor(currentAmount * factor);
      const currentBalance = parseFloat(balanceElement.textContent);

      if (newAmount >= 10 && newAmount <= 1000 && newAmount <= currentBalance) {
        bettingAmountInput.value = newAmount;
      } else if (newAmount > currentBalance) {
        showPopupMessage('Insufficient balance for this adjustment.', '#dc3545'); // Red for error
      } else {
        showPopupMessage('Betting amount must be between $10 and $1000.', '#dc3545'); // Red for error
      }
    });

    inputContainer.appendChild(button);
  });

  // Wrap the input field and buttons inside the container
  bettingAmountInput.parentElement.insertBefore(inputContainer, bettingAmountInput);
  inputContainer.appendChild(bettingAmountInput);

  // Function to show simple popup message
  function showPopupMessage(message, color) {
    const popupMessage = document.createElement('div');
    popupMessage.style.position = 'fixed';
    popupMessage.style.top = '10px';
    popupMessage.style.right = '10px';
    popupMessage.style.padding = '10px 20px';
    popupMessage.style.borderRadius = '5px';
    popupMessage.style.color = '#ffffff';
    popupMessage.style.backgroundColor = color;
    popupMessage.style.fontSize = '1rem';
    popupMessage.style.zIndex = '1000';
    popupMessage.textContent = message;

    document.body.appendChild(popupMessage);

    setTimeout(() => {
      popupMessage.remove();
    }, 3000); // Hide after 3 seconds
  }

  // Function to show result popup with an "Okay" button
  function showResultPopup(message, isWin) {
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay'); // Add CSS class for overlay styling

    const popup = document.createElement('div');
    popup.classList.add('popup'); // Add CSS class for popup styling
    popup.classList.add(isWin ? 'win' : 'lose'); // Dynamically add 'win' or 'lose' class

    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.classList.add('popup-message'); // Add CSS class for message styling
    popup.appendChild(messageElement);

    const okayButton = document.createElement('button');
    okayButton.textContent = 'Okay';
    okayButton.classList.add('okay-button'); // Add CSS class for button styling
    okayButton.addEventListener('click', () => {
      document.body.removeChild(popupOverlay); // Remove the overlay from the DOM
      resetGame(); // Reset the game for the next round
    });

    popup.appendChild(okayButton);
    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay); // Append the overlay to the body
  }

  // Function to scroll the grid into the viewport
  function scrollToGrid() {
    grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Function to disable the start betting button and input field
  function disableStartBetting() {
    startBettingButton.disabled = true;
    startBettingButton.style.backgroundColor = '#d3d3d3'; // Light gray
    startBettingButton.style.cursor = 'not-allowed';
    bettingAmountInput.disabled = true;
    bettingAmountInput.style.backgroundColor = '#f0f0f0'; // Light gray
    bettingAmountInput.style.cursor = 'not-allowed';
  }

  // Reset the game for the next round
  function resetGame() {
    grid.querySelectorAll('.grid-item.selected').forEach(button => button.classList.remove('selected'));
    grid.classList.add('disabled'); // Disable the grid
    submitButton.disabled = true;
    bettingAmountInput.disabled = false;
    bettingAmountInput.style.backgroundColor = ''; // Reset background color
    bettingAmountInput.style.cursor = ''; // Reset cursor
    bettingAmountInput.value = ''; // Clear the betting amount input
    startBettingButton.disabled = false;
    startBettingButton.style.backgroundColor = ''; // Reset background color
    startBettingButton.style.cursor = ''; // Reset cursor
  }

  // Enable the grid and deduct the betting amount when "Start Betting" is clicked
  startBettingButton.addEventListener('click', () => {
    const enteredAmount = parseFloat(bettingAmountInput.value);
    const currentBalance = parseFloat(balanceElement.textContent);

    if (enteredAmount >= 10 && enteredAmount <= 1000 && enteredAmount <= currentBalance) {
      bettingAmount = enteredAmount;
      balanceElement.textContent = (currentBalance - bettingAmount).toFixed(2); // Deduct betting amount
      grid.classList.remove('disabled'); // Enable the grid
      disableStartBetting(); // Disable the start button and input field
      scrollToGrid(); // Scroll the grid into the viewport
      showPopupMessage(`Betting started with $${bettingAmount}!`, '#28a745'); // Green for success
    } else if (enteredAmount > currentBalance) {
      showPopupMessage('Insufficient balance. Please deposit more funds.', '#dc3545'); // Red for error
    } else {
      showPopupMessage('Please enter a valid amount between $10 and $1000.', '#dc3545'); // Red for error
    }
  });

  let smallBetWinCount = 0; // Track the number of small bet wins
  let totalBetAmount = 0; // Track total bet amount
  let totalPayout = 0; // Track total payout

  const odds = {
    2: 1.5, // Odds for matching 2 numbers
    3: 2,   // Odds for matching 3 numbers
    4: 3,   // Odds for matching 4 numbers
    5: 10   // Odds for matching 5 numbers
  };

  let totalBetPool = 0; // Track the total pooled bets for 4 or more players
  let playerCount = 1; // Track the number of players in the current game

  submitButton.addEventListener('click', () => {
    if (!grid.classList.contains('disabled')) {
      const selectedNumbers = Array.from(grid.querySelectorAll('.grid-item.selected')).map(button => parseInt(button.textContent));
      if (selectedNumbers.length === 5) {
        const randomNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 1);
        const matches = selectedNumbers.filter(num => randomNumbers.includes(num));
        let resultMessage = `Random Numbers: ${randomNumbers.join(', ')}<br>Your Numbers: ${selectedNumbers.join(', ')}`;

        // Update total bet amount
        totalBetAmount += bettingAmount;

        // Handle scenarios based on player count
        if (playerCount <= 3) {
          // Drastically reduce the chance of winning for 1-3 players
          const isWin = Math.random() < 0.1; // 10% of normal odds
          const baseWinnings = isWin ? bettingAmount * (odds[matches.length] || 0) : 0;

          if (isWin && baseWinnings > 0) {
            totalPayout += baseWinnings; // Update total payout
            balanceElement.textContent = (parseFloat(balanceElement.textContent) + baseWinnings).toFixed(2); // Add winnings to balance
            resultMessage += `<br>Matches: ${matches.join(', ')}<br>You won $${baseWinnings}!`;
            showResultPopup(resultMessage, true); // Pass `true` for win
          } else {
            resultMessage += `<br>You lost!`;
            showResultPopup(resultMessage, false); // Pass `false` for loss
          }
        } else if (playerCount >= 4) {
          // Pool bets for 4 or more players
          totalBetPool += bettingAmount;
          const systemProfit = totalBetPool * 0.4; // System takes 40% profit
          const payoutPool = totalBetPool * 0.6; // Remaining 60% for winners

          const isWin = matches.length >= 2;
          const winnings = isWin ? payoutPool : 0;

          if (isWin && winnings > 0) {
            balanceElement.textContent = (parseFloat(balanceElement.textContent) + winnings).toFixed(2); // Add winnings to balance
            resultMessage += `<br>Matches: ${matches.join(', ')}<br>You won $${winnings}!`;
            showResultPopup(resultMessage, true); // Pass `true` for win
          } else {
            resultMessage += `<br>You lost!`;
            showResultPopup(resultMessage, false); // Pass `false` for loss
          }

          // Reset the pool after the game
          totalBetPool = 0;
        }
      } else {
        showPopupMessage('Please select exactly 5 numbers.', '#dc3545'); // Red for error
      }
    }
  });

  // Function to set the number of players dynamically
  function setPlayerCount(count) {
    playerCount = count;
  }

  // Example: Set player count dynamically (this can be triggered by UI or other logic)
  setPlayerCount(4); // Example: Set to 4 players for pooled bets

  // Generate grid numbers dynamically
  for (let i = 1; i <= 20; i++) {
    const button = document.createElement('button');
    button.classList.add('grid-item');
    button.textContent = i;

    button.addEventListener('click', () => {
      if (!grid.classList.contains('disabled')) {
        if (button.classList.contains('selected')) {
          button.classList.remove('selected'); // Deselect the number
        } else if (grid.querySelectorAll('.grid-item.selected').length < 5) {
          button.classList.add('selected'); // Select the number
        }

        // Enable the submit button only if exactly 5 numbers are selected
        submitButton.disabled = grid.querySelectorAll('.grid-item.selected').length !== 5;
      }
    });

    grid.appendChild(button);
  }

  // Hide all sections except the main betting section
  const showMainApp = () => {
    app.style.display = 'block';
    betWithFriendSection.style.display = 'none';
    depositSection.style.display = 'none';
    withdrawSection.style.display = 'none';
  };

  const showSection = (section) => {
    app.style.display = 'none';
    betWithFriendSection.style.display = 'none';
    depositSection.style.display = 'none';
    withdrawSection.style.display = 'none';
    section.style.display = 'block';
  };

  // Show main betting section on page load
  showMainApp();

  // Event listeners for navigation buttons
  document.getElementById('bet-with-friend').addEventListener('click', () => {
    showSection(betWithFriendSection);
  });

  document.getElementById('deposit').addEventListener('click', () => {
    showSection(depositSection);
  });

  document.getElementById('withdraw').addEventListener('click', () => {
    showSection(withdrawSection);
  });

  document.getElementById('back-from-bet').addEventListener('click', showMainApp);
  document.getElementById('back-from-deposit').addEventListener('click', showMainApp);
  document.getElementById('back-from-withdraw').addEventListener('click', showMainApp);

  // Handle deposit confirmation
  document.getElementById('confirm-deposit').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const transactionCode = document.getElementById('transaction-code').value.trim();

    if (!transactionCode) {
      showPopupMessage('Please enter a valid transaction code.', '#dc3545'); // Red for error
      return;
    }

    if (!isNaN(amount) && amount >= 100) {
      const currentBalance = parseFloat(balanceElement.textContent);
      balanceElement.textContent = (currentBalance + amount).toFixed(2);
      showPopupMessage(`Deposited $${amount.toFixed(2)} successfully!`, '#28a745'); // Green for success
      showMainApp();
    } else if (amount < 100) {
      showPopupMessage('The minimum deposit amount is $100.', '#dc3545'); // Red for error
    } else {
      showPopupMessage('Please enter a valid amount.', '#dc3545'); // Red for error
    }
  });

  // Handle withdraw confirmation
  document.getElementById('confirm-withdraw').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const currentBalance = parseFloat(balanceElement.textContent);
    if (!isNaN(amount) && amount >= 200 && amount <= currentBalance) {
      balanceElement.textContent = (currentBalance - amount).toFixed(2);
      showPopupMessage(`Withdrew $${amount.toFixed(2)} successfully!`, '#28a745'); // Green for success
      showMainApp();
    } else if (amount < 200) {
      showPopupMessage('The minimum withdrawal amount is $200.', '#dc3545'); // Red for error
    } else {
      showPopupMessage('Please enter a valid amount or ensure sufficient balance.', '#dc3545'); // Red for error
    }
  });

  const depositMethodSelect = document.getElementById('deposit-method');
  const withdrawMethodSelect = document.getElementById('withdraw-method');

  function updatePaymentMethodBackground(selectElement) {
    if (selectElement.value === 'esewa') {
      selectElement.style.backgroundColor = '#8CC63F'; // eSewa green
      selectElement.style.color = '#ffffff'; // White text for contrast
    } else if (selectElement.value === 'khalti') {
      selectElement.style.backgroundColor = '#5D2E8C'; // Khalti purple
      selectElement.style.color = '#ffffff'; // White text for contrast
    } else {
      selectElement.style.backgroundColor = ''; // Reset background color
      selectElement.style.color = ''; // Reset text color
    }
  }

  // Set initial background color for deposit and withdraw method fields
  updatePaymentMethodBackground(depositMethodSelect);
  updatePaymentMethodBackground(withdrawMethodSelect);

  depositMethodSelect.addEventListener('change', () => {
    updatePaymentMethodBackground(depositMethodSelect);
  });

  withdrawMethodSelect.addEventListener('change', () => {
    updatePaymentMethodBackground(withdrawMethodSelect);
  });
});
