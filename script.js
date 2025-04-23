document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const riskForm = document.getElementById('riskForm');
    if (riskForm) {
        riskForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = riskForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

            // Collect form data
            const formData = {
                age: document.getElementById('age').value,
                gender: document.querySelector('input[name="gender"]:checked').value,
                systolic: document.getElementById('systolic').value,
                diastolic: document.getElementById('diastolic').value,
                cholesterol: document.getElementById('cholesterol').value,
                hdl: document.getElementById('hdl').value,
                smoker: document.getElementById('smoker').checked,
                diabetes: document.getElementById('diabetes').checked,
                family_history: document.getElementById('family_history').checked
            };

            try {
                // Send data to backend
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                // Store result for display on results page
                localStorage.setItem('riskResult', JSON.stringify(result));
                window.location.href = 'results.html';
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your request. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Calculate My Risk <i class="fas fa-calculator ml-2"></i>';
            }
        });
    }

    // Display results on results page
    const resultContainer = document.getElementById('resultContainer');
    if (resultContainer) {
        const storedResult = localStorage.getItem('riskResult');
        if (storedResult) {
            const result = JSON.parse(storedResult);
            displayResults(result);
        } else {
            resultContainer.innerHTML = `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-red-800">No results found</h3>
                            <div class="mt-2 text-sm text-red-700">
                                <p>Please complete the risk assessment form first.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pt-6">
                    <a href="form.html" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Go to Assessment Form <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            `;
        }
    }

    function displayResults(result) {
        // Update risk level
        document.getElementById('riskLevel').textContent = result.risk_level;
        document.getElementById('riskDescription').textContent = result.description;

        // Update confidence level
        const confidencePercent = Math.round(result.confidence * 100);
        document.getElementById('confidenceBar').style.width = `${confidencePercent}%`;
        document.getElementById('confidenceText').textContent = `${confidencePercent}% confidence`;

        // Update recommendations
        const recommendationsList = document.getElementById('recommendations');
        recommendationsList.innerHTML = '';
        result.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });

        // Set appropriate colors based on risk level
        const riskCard = resultContainer.querySelector('.bg-blue-50');
        if (result.risk_level.toLowerCase().includes('high')) {
            riskCard.classList.remove('bg-blue-50', 'border-blue-500');
            riskCard.classList.add('bg-red-50', 'border-red-500');
            document.querySelector('.fa-heartbeat').classList.remove('text-blue-500');
            document.querySelector('.fa-heartbeat').classList.add('text-red-500');
            document.getElementById('riskLevel').classList.remove('text-blue-800');
            document.getElementById('riskLevel').classList.add('text-red-800');
            document.getElementById('riskDescription').classList.remove('text-blue-700');
            document.getElementById('riskDescription').classList.add('text-red-700');
        } else if (result.risk_level.toLowerCase().includes('medium')) {
            riskCard.classList.remove('bg-blue-50', 'border-blue-500');
            riskCard.classList.add('bg-yellow-50', 'border-yellow-500');
            document.querySelector('.fa-heartbeat').classList.remove('text-blue-500');
            document.querySelector('.fa-heartbeat').classList.add('text-yellow-500');
            document.getElementById('riskLevel').classList.remove('text-blue-800');
            document.getElementById('riskLevel').classList.add('text-yellow-800');
            document.getElementById('riskDescription').classList.remove('text-blue-700');
            document.getElementById('riskDescription').classList.add('text-yellow-700');
        }
    }
});