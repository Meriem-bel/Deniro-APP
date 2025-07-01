import numpy as np
from pulp import LpProblem, LpVariable, LpMinimize, LpStatus
from collections import defaultdict

class BudgetOptimizer:
    def __init__(self, income, expenses, priorities, user_rules=None, essential_savings=0.15):
        self.income = income
        self.original_expenses = expenses.copy()
        self.priorities = priorities
        self.essential_savings = max(5000, income * essential_savings)
        
        # Initialize user rules with proper defaults
        self.user_rules = {
            'non_negotiable': ['rent', 'utilities'],
            'min_values': {'food': 10000, 'health': 3000, 'transport': 2000},
            'max_reduction_pct': 0.8
        }
        
        # Update with user-provided rules
        if user_rules:
            if 'non_negotiable' in user_rules:
                # Clean and validate non-negotiable categories
                self.user_rules['non_negotiable'] = [
                    x.strip() for x in user_rules['non_negotiable'] 
                    if x.strip() in expenses
                ] or ['rent', 'utilities']
            
            if 'min_values' in user_rules:
                # Update minimum values
                for cat, val in user_rules['min_values'].items():
                    if cat in expenses:
                        self.user_rules['min_values'][cat] = max(1000, val)
            
            if 'max_reduction_pct' in user_rules:
                self.user_rules['max_reduction_pct'] = min(0.9, max(0.1, user_rules['max_reduction_pct']))
        
        self.adjustable_categories = [
            k for k in expenses.keys() 
            if k not in self.user_rules['non_negotiable']
        ]
        self._used_emergency_fallback = False

    def optimize(self):
        """Hybrid optimization approach"""
        solution = self._csp_optimize()
        if not solution:
            solution = self._lp_optimize()
        if not solution:
            solution = self._relaxed_constraints_optimize()
        if not solution:
            solution = self._emergency_fallback()
            self._used_emergency_fallback = True
        return solution

    def _csp_optimize(self):
        domains = self._create_domains()
        constraints = [
            self._total_expense_constraint,
            self._priority_constraint,
            self._minimum_living_constraint
        ]
        return self._backtracking_search({}, domains, constraints)

    def _create_domains(self):
        domains = {}
        for category, amount in self.original_expenses.items():
            if category in self.user_rules['non_negotiable']:
                domains[category] = [amount]
            else:
                priority_weight = 1 / max(1, self.priorities.get(category, 1))
                min_val = max(
                    self.user_rules['min_values'].get(category, 1000),
                    amount * (1 - self.user_rules['max_reduction_pct'])
                )
                domains[category] = list(np.linspace(
                    amount, min_val, 
                    num=max(3, int(10 * priority_weight)),
                    dtype=int
                ))
        return domains

    def _backtracking_search(self, assignment, domains, constraints):
        if len(assignment) == len(self.original_expenses):
            return assignment
            
        unassigned = [v for v in self.original_expenses if v not in assignment]
        next_var = min(unassigned, key=lambda v: len(domains[v]))
        
        for value in sorted(domains[next_var], reverse=True):
            new_assignment = assignment.copy()
            new_assignment[next_var] = value
            
            if all(constraint(new_assignment) for constraint in constraints):
                result = self._backtracking_search(new_assignment, domains, constraints)
                if result:
                    return result
        return None

    def _lp_optimize(self):
        prob = LpProblem("BudgetOptimization", LpMinimize)
        vars = {
            cat: LpVariable(
                cat,
                lowBound=max(1000, self.user_rules['min_values'].get(cat, 1000)),
                upBound=self.original_expenses[cat]
            ) for cat in self.adjustable_categories
        }
        
        # Objective: Minimize weighted discomfort
        prob += sum(
            (self.original_expenses[cat] - vars[cat]) * (1 / max(1, self.priorities.get(cat, 1)))
            for cat in self.adjustable_categories
        )
        
        # Constraint: Total expenses + savings <= income
        prob += sum(vars.values()) + sum(
            self.original_expenses[cat] for cat in self.user_rules['non_negotiable']
        ) + self.essential_savings <= self.income
        
        prob.solve()
        
        if LpStatus[prob.status] == "Optimal":
            solution = self.original_expenses.copy()
            for cat in vars:
                solution[cat] = int(vars[cat].varValue)
            return solution
        return None

    def _relaxed_constraints_optimize(self):
        original_mins = self.user_rules['min_values'].copy()
        for relaxation in [0.8, 0.6, 0.4]:
            for cat in self.user_rules['min_values']:
                self.user_rules['min_values'][cat] = max(
                    1000,
                    original_mins[cat] * relaxation
                )
            solution = self._lp_optimize()
            if solution:
                return solution
        return None

    def _emergency_fallback(self):
        solution = self.original_expenses.copy()
        fixed_costs = sum(
            self.original_expenses[cat] for cat in self.user_rules['non_negotiable']
        ) + self.essential_savings
        
        if fixed_costs >= self.income:
            for cat in self.adjustable_categories:
                solution[cat] = max(1000, self.user_rules['min_values'].get(cat, 1000))
            return solution
            
        remaining_income = self.income - fixed_costs
        adjustable_total = sum(
            self.original_expenses[cat] for cat in self.adjustable_categories
        )
        
        if adjustable_total > 0:
            for cat in self.adjustable_categories:
                solution[cat] = max(
                    1000,
                    int(self.original_expenses[cat] * (remaining_income / adjustable_total))
                )
        return solution

    # Constraint checkers
    def _total_expense_constraint(self, assignment):
        if not assignment:
            return True
        total = sum(assignment.values()) + self.essential_savings
        return total <= self.income

    def _priority_constraint(self, assignment):
        if len(assignment) < len(self.original_expenses):
            return True
            
        priority_order = sorted(self.priorities.items(), key=lambda x: x[1])
        reductions = {
            cat: (self.original_expenses[cat] - assignment[cat]) / max(1, self.original_expenses[cat])
            for cat in assignment if self.original_expenses[cat] > 0
        }
        
        for i in range(len(priority_order)-1):
            curr_cat, _ = priority_order[i]
            next_cat, _ = priority_order[i+1]
            if reductions.get(curr_cat, 0) > reductions.get(next_cat, 0):
                return False
        return True

    def _minimum_living_constraint(self, assignment):
        if not assignment:
            return True
        return all(
            assignment.get(cat, 0) >= self.user_rules['min_values'].get(cat, 1000)
            for cat in self.user_rules['min_values']
        )


class BudgetPlanner:
    def __init__(self):
        self.user_profile = None
        self.currency = "DZD"

    def collect_user_data(self):
        print("\n" + "="*50)
        print("Budget Planner Input")
        print("="*50)
        
        profile = {
            'income': self._get_numeric_input("Monthly income (DZD): ", min_val=1000),
            'expenses': {},
            'priorities': {},
            'user_rules': {'min_values': {}}
        }

        categories = [
            ('rent', "Rent/Mortgage"),
            ('food', "Food/Groceries"),
            ('transport', "Transportation"),
            ('utilities', "Utilities"),
            ('health', "Healthcare"),
            ('education', "Education"),
            ('clothing', "Clothing"),
            ('internet', "Internet/Phone")
        ]

        print("\nEnter monthly expenses:")
        for code, name in categories:
            profile['expenses'][code] = self._get_numeric_input(f"{name}: ", min_val=0)

        print("\nSet spending priorities (1=Most Important):")
        priority_categories = [cat for cat, _ in categories if profile['expenses'][cat] > 0]
        assigned = set()
        
        for category in priority_categories:
            while True:
                try:
                    priority = int(input(f"Priority for {category} (1-{len(priority_categories)}): "))
                    if 1 <= priority <= len(priority_categories) and priority not in assigned:
                        profile['priorities'][category] = priority
                        assigned.add(priority)
                        break
                    print(f"Enter unique number between 1-{len(priority_categories)}")
                except ValueError:
                    print("Please enter a number")

        print("\nCustom Rules (press Enter for defaults):")
        non_negotiable = input(
            "Non-negotiable categories (comma-separated, default: rent,utilities): "
        ).strip()
        profile['user_rules']['non_negotiable'] = [
            x.strip() for x in non_negotiable.split(',') 
            if x.strip() in profile['expenses']
        ] or ['rent', 'utilities']
        
        try:
            min_food = float(input("Minimum food budget (default 10000): ") or 10000)
            profile['user_rules']['min_values']['food'] = max(1000, min_food)
        except ValueError:
            print("Invalid input, using default 10000")
            profile['user_rules']['min_values']['food'] = 10000
            
        return profile

    def optimize_and_show(self, profile):
        optimizer = BudgetOptimizer(
            income=profile['income'],
            expenses=profile['expenses'],
            priorities=profile['priorities'],
            user_rules=profile['user_rules']
        )
        
        optimized = optimizer.optimize()
        report = self._generate_report(optimizer, optimized)
        self._print_report(report)

    def _generate_report(self, optimizer, optimized_expenses):
        report = {
            'original_total': sum(optimizer.original_expenses.values()),
            'optimized_total': sum(optimized_expenses.values()),
            'savings': sum(optimizer.original_expenses.values()) - sum(optimized_expenses.values()),
            'essential_savings': optimizer.essential_savings,
            'remaining_balance': optimizer.income - sum(optimized_expenses.values()) - optimizer.essential_savings,
            'adjustments': [],
            'notes': [],
            'untouched_categories': []
        }

        # Identify untouched categories
        for cat in optimizer.original_expenses:
            original = optimizer.original_expenses[cat]
            new = optimized_expenses[cat]
            
            if original == new:
                reason = ""
                if cat in optimizer.user_rules['non_negotiable']:
                    reason = "Protected as non-negotiable"
                elif optimizer.priorities.get(cat, 99) <= 2:
                    reason = "High priority (1-2)"
                elif original <= optimizer.user_rules['min_values'].get(cat, 1000):
                    reason = "Already at minimum spending"
                
                if reason:
                    report['untouched_categories'].append({
                        'category': cat,
                        'amount': new,
                        'reason': reason
                    })
            else:
                reduction_pct = round((original - new)/original*100, 1) if original > 0 else 0
                report['adjustments'].append({
                    'category': cat,
                    'original': original,
                    'optimized': new,
                    'reduction_pct': reduction_pct,
                    'reason': self._explain_adjustment(cat, original, new, optimizer)
                })

        # Add warnings for aggressive cuts
        aggressive_cuts = [adj for adj in report['adjustments'] 
                          if adj['reduction_pct'] >= 50 and adj['optimized'] > 0]
        for adj in aggressive_cuts:
            report['notes'].append(
                f"Warning: {adj['category'].title()} was cut by {adj['reduction_pct']}%. "
                f"Verify if this is sustainable."
            )

        # Add trade-off suggestions
        if report['remaining_balance'] <= 0:
            savings_pct = optimizer.essential_savings / optimizer.income
            if savings_pct >= 0.15:
                alternative_savings = optimizer.income * 0.10
                report['notes'].append(
                    f"To reduce cuts, you could decrease savings to 10% ({alternative_savings:,.0f} {self.currency})."
                )

        return report

    def _print_report(self, report):
        print("\n" + "="*50)
        print("Optimization Results")
        print("="*50)
        
        print(f"\nOriginal Total Expenses: {report['original_total']:,.0f} {self.currency}")
        print(f"Optimized Total Expenses: {report['optimized_total']:,.0f} {self.currency}")
        print(f"Essential Savings ({report['essential_savings']/report['original_total']*100:.0f}%): "
              f"{report['essential_savings']:,.0f} {self.currency}")
        print(f"Remaining Balance: {report['remaining_balance']:,.0f} {self.currency}")
        
        if report['untouched_categories']:
            print("\nProtected Categories:")
            for item in report['untouched_categories']:
                print(f"{item['category'].title():<10} | {item['amount']:,.0f} {self.currency} "
                      f"(Not cut: {item['reason']})")

        if report['adjustments']:
            print("\nAdjustments Made:")
            for adj in report['adjustments']:
                print(f"{adj['category'].title():<10} | {adj['original']:,.0f} → {adj['optimized']:,.0f} {self.currency} "
                      f"(-{adj['reduction_pct']}%) | {adj['reason']}")
        
        if report['notes']:
            print("\nNotes:")
            for note in report['notes']:
                print(f"• {note}")
        
        if report['remaining_balance'] < 0:
            print("\n❌ Still over budget! Consider increasing income or reducing fixed costs.")
        else:
            print("\n✅ Budget successfully balanced!")

    def _explain_adjustment(self, category, original, new, optimizer):
        priority = optimizer.priorities.get(category, 99)
        reduction = original - new
        reduction_pct = reduction / original if original > 0 else 0

        if category in optimizer.user_rules['non_negotiable']:
            return "Non-negotiable (no change)"
        elif priority <= 2:
            return "High priority (minimal cut)"
        elif reduction_pct > 0.5:
            return f"Large cut (saved {reduction:,.0f} {self.currency})"
        else:
            return "Balanced reduction"

    def _get_numeric_input(self, prompt, min_val=None, max_val=None):
        while True:
            try:
                value = float(input(prompt))
                if (min_val is None or value >= min_val) and (max_val is None or value <= max_val):
                    return value
                print(f"Please enter between {min_val or '-∞'} and {max_val or '∞'}")
            except ValueError:
                print("Please enter a valid number")

def main():
    print("=== Budget Optimization System ===")
    planner = BudgetPlanner()
    profile = planner.collect_user_data()
    planner.optimize_and_show(profile)

if __name__ == "__main__":
    main()