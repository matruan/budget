// Buget controller

var budgetController = (function () {

	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems: {
			expenses: [],
			income: []
		},
		totals: {
			expenses: 0,
			income: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		});
		data.totals[type] = sum;
	}

	return {
		addItem: function (type, des, val) {
			var newItem, id;

			if (data.allItems[type].length === 0) {
				id = 1;
			} else {
				id = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}
			if (type === 'expenses') {
				newItem = new Expense(id, des, val);
			} else {
				newItem = new Income(id, des, val);
			}

			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function (type, id) {
			var ids, index; 

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);
			
			data.allItems[type].splice(index,1);
			
		},

		calculateBudget: function() {
			calculateTotal('expenses');
			calculateTotal('income');
			data.budget = data.totals.income - data.totals.expenses;
			data.totals.income === 0 ? data.percentage = -1 : data.percentage = Math.round((data.totals.expenses / data.totals.income) * 100);
		},

		calculatePercentages: function() {
			data.allItems.expenses.forEach(function(current){
				current.calcPercentage(data.totals.income);
			});
		},

		getPercentages: function() {
			var allPerc;
			
			allPerc = data.allItems.expenses.map(function(current) {
				return current.getPercentage();
			});

			return allPerc;
		},

		getBudget: function() { 
			return {
				totalExpense: data.totals.expenses,
				totalIncome: data.totals.income,
				budget: data.budget,
				percentage: data.percentage
			}
		},

		testing: function () {
			console.log(data);
		}
	}

})();


// UI Controller

var uiController = (function () {

	var domStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		container: '.container',
		budgetValue: '.budget__value',
		budgetIncomeValue: '.budget__income--value',
		budgetIncomePercentage: '.budget__income--percentage',
		budgetExpensesValue: '.budget__expenses--value',
		budgetExpensesPercentage: '.budget__expenses--percentage',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumbers = function(num, type){
		var numSplit, int, dec;
		var intWithPointsAux = "";
		var intWithPoints = "";
		var count = 0;

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');

		int = numSplit[0];
		dec = numSplit[1];
		
		if (int.length > 3) {
			 for (var i = int.length-1; i >= 0; i--){
				if (count === 3){
					intWithPointsAux+=".";
					count = 0;
				}
				intWithPointsAux+=int[i];
				count++;
			}
			
			for (var i = intWithPointsAux.length-1; i>=0; i--){
				intWithPoints+=intWithPointsAux[i];
			}

		} else {
			intWithPoints = int;
		}
					
		return (type === "income" ? "+" : "-") + intWithPoints + "'" + dec;
	};

	// How to write a function that accepts a function as a parameter
	var nodeListForEach = function(list, callback){
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function () {
			return {
				type: document.querySelector(domStrings.inputType).value,
				description: document.querySelector(domStrings.inputDescription).value,
				value: parseFloat(document.querySelector(domStrings.inputValue).value)
			};
		},

		displayBudget: function(budget) {
			budget.budget > 0 ? document.querySelector(domStrings.budgetValue).textContent = formatNumbers(budget.budget, 'income') : document.querySelector(domStrings.budgetValue).textContent = formatNumbers(budget.budget, 'expenses');
			document.querySelector(domStrings.budgetIncomeValue).textContent = formatNumbers(budget.totalIncome, 'income');
			document.querySelector(domStrings.budgetExpensesValue).textContent = formatNumbers(budget.totalExpense, 'expenses');
			
			if (budget.percentage !== -1) {
				document.querySelector(domStrings.budgetExpensesPercentage).textContent = budget.percentage + '%';
			} else {
				document.querySelector(domStrings.budgetExpensesPercentage).textContent = '--';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(domStrings.expensesPercLabel);

			// Now we call the function with an anonymous function
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] !== -1) {
					current.textContent = percentages[index] + "%";
				} else {
					current.textContent = "--"
				}
			});

		},

		displayMonth: function() {
			var now, year, month, months;
			now = new Date();
			months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(domStrings.dateLabel).textContent = months[month] + ' de ' + year;

		},

		
		addListItem: function (obj, type) {
			var html, newHtml, element;
			if (type === 'income') {
				element = domStrings.incomeContainer;
				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				element = domStrings.expensesContainer;
				html = '<div class="item clearfix" id="expenses-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHtml = html.replace("%id%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumbers(obj.value, type));

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		removeListItem: function(selectorId) {
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (current) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		getDomStrings: function () {
			return domStrings;
		},

		changedType: function() {
			var fields = document.querySelectorAll(
				domStrings.inputType + ', ' + domStrings.inputDescription + ', ' + domStrings.inputValue
			);

			nodeListForEach(fields, function(current){
				current.classList.toggle('red-focus');
			});

			document.querySelector(domStrings.inputBtn).classList.toggle('red');
		}
	};

})();

// Global App Controller

var controller = (function (budgetCtrl, uiCtrol) {

	var setupEventListeners = function () {
		var dom = uiCtrol.getDomStrings();

		document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function (event) {
			if (event.code === "Enter") {
				ctrlAddItem();
			}
		});

		document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(dom.inputType).addEventListener('change', uiCtrol.changedType);
	};

	var updateBudget = function () {

		budgetCtrl.calculateBudget();

		var budget = budgetCtrl.getBudget();

		uiCtrol.displayBudget(budget);

	};

	var updatePercentages = function() {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages
		uiCtrol.displayPercentages(percentages);

	};


	var ctrlAddItem = function () {

		var input, newItem;
		// 1. Get the field input data
		input = uiCtrol.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the buget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			
			// 3. Add the item to the UI
			uiCtrol.addListItem(newItem, input.type);

			// 4. Clear the fields
			uiCtrol.clearFields();

			// 4. Calculate the budget
			updateBudget();
			updatePercentages();
		
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemId, splitId, type, id;

		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];

			// Type coercion:
			id = +splitId[1];
			
			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, id);
			// 2. Delete the item from the UI
			uiController.removeListItem(itemId);

			// 3. Update and show the new Item
			updateBudget();
			updatePercentages();
		}
	}

	return {
		init: function () {
			console.log("Application has started.");
			uiCtrol.displayMonth();
			setupEventListeners();
		}
	};
})(budgetController, uiController);

controller.init();
