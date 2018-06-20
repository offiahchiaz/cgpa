// Result Controller
var CGPAController = (function() {

    var Result = function(id, description, unit, score) {
        this.id = id;
        this.description = description;
        this.unit = unit;
        this.score = score;
        this.percentage = -1;
    };     

    var calculateTotal = function() {
        var sum = 0;

        data.allItems.result.forEach(function(current) {
            sum += current.score;
        });
        data.totals.obtainedScore = sum;
        console.log('sum = ', sum);
        console.log(data.allItems.result.length * 100);
        
    };

    var calculateGP = function() {
        var cgpa = 0, creditUnit = 0, grade, result ;
        data.allItems.result.forEach(function(current) {

            creditUnit += current.unit
            if (current.score >= 70) {
                grade = 5;
            } else if (current.score >= 60 && current.score <= 69) {
                grade = 4;
            } else if (current.score >= 50 && current.score <= 59) {
                grade = 3;
            } else if (current.score >= 40 && current.score <= 49) {
                grade = 2;
            } else if (current.score >= 31 && current.score <= 39) {
                grade = 1;
            } else {
                grade = 0;
            }
            cgpa += (current.unit * grade);
            result = cgpa/creditUnit;
        });
        data.cgpa = result;
        // console.log('unit * score = ', cgpa);
        // console.log('unit = ', creditUnit);
        // console.log('cgpa = ', result);

    };

    var data = {
        allItems: {
            result: []
        },
        totals: {
            availableScore: 0,
            obtainedScore: 0
        },
        cgpa: 0,
        percentage: -1
    }

    return {
        addResult: function(des, unit, score) {
            var newItem, ID;

             // Create new ID
            if (data.allItems.result.length > 0) {
                ID = data.allItems.result[data.allItems.result.length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item
            newItem = new Result(ID, des, unit, score);

            // Push it into our data structure
            data.allItems.result.push(newItem);

            // Return the new element
            return newItem
        },

        calculateCGPA: function() {
            
            // Total score obtained
            calculateTotal();

            // Total available score
            data.totals.availableScore = data.allItems.result.length * 100;

            // Calculate CGPA
            calculateGP();

            // Calculate Percentage of total score obtained
            if (data.totals.availableScore > 0) {
                data.percentage = ((data.totals.obtainedScore / data.totals.availableScore) * 100).toFixed(2);
            } else {
                data.percentage = -1;
            }

        },

        getCGPA: function() {
            return {
                cgpa: data.cgpa,
                availableScore: data.totals.availableScore,
                obtainedScore: data.totals.obtainedScore,
                percentage: data.percentage
            };
        },
    }

})();

// UI Controller
var UIController = (function() {

    var DOMstrings = {
        inputDescription: '.subject__description',
        inputUnit: '.subject__unit',
        inputScore: '.subject__score',
        resultContainer: '.result__list',
        inputBtn: '.subject__btn',
        cgpaLabel: '.cgpa__value',
        availableScoreLabel: '.available__score--value',
        obtainedScoreLabel: '.obtained__score--value',
        percentageLabel: '.obtained__score--percentage',

    };

    return {
        getInput: function() {
            return {
                description: document.querySelector(DOMstrings.inputDescription).value,
                unit: +(document.querySelector(DOMstrings.inputUnit).value),
                score: parseFloat(document.querySelector(DOMstrings.inputScore).value)
            }
        },

        addListItem: function(obj) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            element = DOMstrings.resultContainer;
            html = '<div class="item clearfix" id="result-%id%"><div class="item__description">%description%</div><div class="item__unit">%unit%</div><div class="right clearfix"><div class="item__score">%score%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%unit%', obj.unit);
            newHtml = newHtml.replace('%score%', obj.score);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        displayCGPA: function(obj) {
            document.querySelector(DOMstrings. cgpaLabel).textContent = obj.cgpa;
            document.querySelector(DOMstrings.availableScoreLabel).textContent = obj.availableScore;
            document.querySelector(DOMstrings.obtainedScoreLabel).textContent = obj.obtainedScore;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';                
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';                
            }

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();

// App Controller
var appController = (function(cpgatCtrl, UICtrl) {
    var input, newItem;

    var setupEventListerners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddResult);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddResult();
            }
        });

    }

    var updateCGPA = function() {

        // 1. Calculate the CGPA
        cpgatCtrl.calculateCGPA();

        // 2. Return the CGPA
        var cgpa = cpgatCtrl.getCGPA();

        // 3. Display the CGPA on the UI
        UICtrl.displayCGPA(cgpa);

    };


    var ctrlAddResult = function() {
        
        // 1. Get the field input data
        input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.score) && input.score > 0) {
            
            // 2. Add the item on the budget controller
            newItem = cpgatCtrl.addResult(input.description, input.unit, input.score);

             // 3. Add the item to the UI
             UICtrl.addListItem(newItem);

            // 4. Clear the fields

            // 5. Calculate and update budget
            updateCGPA();

            // 6. Calculate and update percentages
        }

    }

    return {
        init: function() {
            console.log('App started');
            setupEventListerners();
        }
    }
})(CGPAController, UIController);

appController.init();