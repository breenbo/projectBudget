// use module pattern to encaspulate datas and variablesin private and publics
// use IIFE (Immediatly Invoked Function Expression) and closure
// 
// BUDGET CONTROLER
let budgetController = (function() {

    // create a function constructor to create lots of income or expense objects
    // Use a capital letter in beginning to recognize them
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    // add prototype to calculate individual percentages
    Expense.prototype.calcPercentage = function(totalIncome) {
        // calculate the individual percentage
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }
    // get the calculated percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type) {
        let sum = 0
        // calculate the sum of all value in data, depending of the type (income, expense)
        // forEach method apply the function to all value in the array
        data.allItems[type].forEach(function(cur) {
            sum = sum + cur.value
        })
        // store the result in the datastructure
        data.totals[type] = sum
    }

    // create a data structure to store all values : an object with object of arrays for all incomes and expenses
    // and an object with total value of income and expenses
    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        // use -1 to explain that it doesn't exist yet
        percentage: -1
    }

    // PUBLIC PART -------------------------
    // create a public function to fill the datastructure : use the constructors
    return {
        addItems: function(type, desc, val) {
            let newItem, ID
            // create a unique ID : take the last stored id and add 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            // newItem can be an expense or an income
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
            }
            // store in data and give external access to newItem
            data.allItems[type].push(newItem)
            return newItem
        },

        deleteItem: function(type, id) {
            let ids, index
            // use map method to loop in an array
            ids = data.allItems[type].map(function(current) {
                return current.id
            })
            index = ids.indexOf(id)
            // delete the element from the datastructure
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        // calculate the budget
        calculateBudget: function() {
            // calculate total income and expense
            calculateTotal('inc')
            calculateTotal('exp')
            // calculate the budget : income - expense
            data.budget = data.totals.inc - data.totals.exp
            // calculate the % : %(expense) of income, only if some income exists
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        // return total income, expense, budget and percentage
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        calculatePercentages: function() {
            // calculate percentage of each expense in the array : use forEach method
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc)
            })
        },

        getPercentages: function() {
            // use map method iot store the calculated percentages and return them
            let allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage()
            })
            return allPerc
        },

        // testig method to see if input go to data
        testing: function() {
            console.log(data)
        }
    }

})(); // () to invoke function at the end

// UI CONTROLER
let UIcontroller = (function() {
    // create a private variable to retrieve some DOM element, and allow easy modification of html
    // if change, change value just here
    let DOMstrings = {
        inputType: 'add__type',
        inputDescription: 'add__description',
        inputValue: 'add__value',
        inputChangable: 'changable',
        inputBtn: 'add__btn',
        incomeContainer: 'income__list',
        expenseContainer: 'expense__list',
        budgetLabel: 'budget__value',
        incomeLabel: 'budget__income--value',
        expenseLabel: 'budget__expenses--value',
        percentageLabel: 'budget__expenses--percentage',
        container: 'container',
        expensePercLabel: 'item__percentage',
        dateLabel: 'budget__title--month'
    }

    // format number fonction, private because only use in this module
    let formatNumber = function(num, type) {
        // 23465.84839 -> + 23 465.85
        let numSplit, int, dec
        num = Math.abs(num)
        // exactly 2 decimal points
        num = num.toFixed(2) // return a string
        // space separate the thousands
        numSplit = num.split('.') // array with integer and decimal part
        int = numSplit[0]
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ' ' + int.substr(int.length - 3, 3)
        }
        dec = numSplit[1]

        // + or - before the number
        // compact if else statement 
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
    }

    // PUBLIC PART -------------------------
    // get the user input and use it -> must be a public method
    return {
        getInput: function() {
            return {
                type: document.getElementById(DOMstrings.inputType).value,
                description: document.getElementById(DOMstrings.inputDescription).value,
                // take the value and parse it to float iot made some calculations after
                value: parseFloat(document.getElementById(DOMstrings.inputValue).value)
            }
        },

        // change DOMstrings to public variable iot access it outside this module
        getDOMstrings: function() {
            return DOMstrings
        },

        // add created income/expense into UI
        addListItem: function(obj, type) {
            let html, newHtml, element
            // create HTML string with placeholder text
            // create placeholder surrounded by % (easier to retrieve)
            if (type === 'inc') {
                element = DOMstrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%' + 
                    '"> <div class="item__description">%description%' +
                    '</div> <div class="right clearfix"> <div class="item__value">%value%' +
                    '</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer
                html = '<div class="item clearfix" id="exp-%id%' +
                    '"> <div class="item__description">%description%' +
                    '</div> <div class="right clearfix"> <div class="item__value">%value%' +
                    '</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div> '
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            // insert the HTML into the DOM
            // insert as child of income/expense container
            // use beforeend to append one after all
            document.getElementById(element).insertAdjacentHTML('beforeend', newHtml)
        },
        
        // method to delete an item from the UI
        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        // method to clear the fields after input
        clearFields: function() {
            let fields, field
            fields = document.getElementsByClassName('clearable')
            // set each value to empty
            for (field of fields) {
                field.value = ""
            }
            // give the focus to the first element after clearing
            fields[0].focus()
        },

        displayBudget: function(obj) {
            // change the textContent of each element with the budgets values
            // use the values returned by the getBudget method (see the name), applied to an object
            // use formatNumber fonction, so need to create some artificial type for budget :
            obj.budget > 0 ? type = 'inc' : type = 'exp'

            document.getElementById(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.getElementById(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.getElementById(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp')

            if (obj.percentage > 0) {
                document.getElementById(DOMstrings.percentageLabel).textContent = obj.percentage + ' %'
            } else {
                document.getElementById(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        // display individual percentages for each expense
        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll('.' + DOMstrings.expensePercLabel)
            // fields is a nodeListe, so no forEach because not array
            // must create a custom forEach method to apply on the nodeList

            let nodeListForEach = function(list, callback) {
                let len = list.length
                for (let i = 0; i < len; i++) {
                    callback(list[i], i)
                }
            }

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + ' %'
                } else {
                    current.textContent = '---'
                }
            })
        },

        // fonction to display month and year, for the init function
        displayMonth: function() {
            let now, year, month, months
            now = new Date()
            year = now.getFullYear()
            month = now.getMonth()
            months = ['Janvier','Février','Mars','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
            document.getElementById(DOMstrings.dateLabel).textContent = months[month - 1] + ' ' + year
        },

        //change input border depending on the type of transaction
        changedType: function() {
            let field, fields, button
            fields = document.getElementsByClassName(DOMstrings.inputChangable)
            for  (field of fields) {
                field.classList.toggle('red-focus')
            }

            button = document.getElementById(DOMstrings.inputBtn)
            button.classList.toggle('red')
        }
    }
})();

// app controler module
// connect the 2 previous modules
let controler = (function(budgetCtrl, UICtrl) {
    // put event listener in one place
    let setEventListeners = function() {
      // access DOMstrings
      let DOM = UICtrl.getDOMstrings()
      
      // get user input when click on button
      document.getElementById(DOM.inputBtn).addEventListener('click', ctrlAddItem)
      
      // allow to use the return key instead of the button
      document.addEventListener('keypress', function(event) {
          if (event.keyCode === 13) {
              ctrlAddItem()
          }
      })

      // add event listener to the container div, which will work with all income and expense childs due to event delegation
      // because it's impossible to add event listener to an element not yet in the DOM
      document.getElementById(DOM.container).addEventListener('click', ctrlDeleteItem)

      // add event listener on change of type of input (income or expense)
      document.getElementById(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }

    let updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget()

        // 2. Return the budget
        let budget = budgetCtrl.getBudget()

        // 3. Display the budget to the UI controller
        UICtrl.displayBudget(budget)
    }

    // update individual percentage on each entry add or delete
    let updatePercentages = function() {
        // 1. calculate the percentages
        budgetCtrl.calculatePercentages()
        // 2. Read percentage from the budget controller
        let percentages = budgetCtrl.getPercentages()
        // 3. Update percentage in the UI controller
        UICtrl.displayPercentages(percentages)
    }

    let ctrlAddItem = function() {
        let input, newItem
        // 1. Get the input value
        input = UICtrl.getInput()

        // control that the input are usable
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller : pass the input object to the addItems method
            newItem = budgetCtrl.addItems(input.type, input.description, input.value)

            // 3. Add the previous newItem to the UI controller
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the fields after entering
            UICtrl.clearFields()

            // 5. Calculate and update the budget
            updateBudget()

            // 6. Calculate and update the budget
            updatePercentages()
        } 
    }

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID
        // use event.target to see which element is clicked
        // up DOM to go to the container and get his id
        itemID = event.target.parentNode.parentNode.parentNode.id
        // retrieve the type and number of the element
        if (itemID) {
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])
        }
        // 1. delete the item from the data structure
        budgetCtrl.deleteItem(type, ID)

        // 2. delete the item form the UI
        UICtrl.deleteListItem(itemID)

        // 3. update and show the new budget
        updateBudget()

        // 4. Calculate and update the budget
        updatePercentages()
    }

    // PUBLIC PART -------------------------
    // create a public init function
    return {
        init: function() {
            setEventListeners()
            // reset all the displayed values, using an init object
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            UICtrl.displayMonth()

            console.log('Application started')
        }
    }

})(budgetController, UIcontroller); // apply fonction to budgetController and UIcontroller

// fire the init function iot have event listener started
controler.init()
