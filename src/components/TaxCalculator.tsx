import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxCalculatorProps {
  onCalculationComplete: (result: string) => void;
}

export const TaxCalculator = ({ onCalculationComplete }: TaxCalculatorProps) => {
  const [income, setIncome] = useState("");
  const [regime, setRegime] = useState("new");
  const [deductions, setDeductions] = useState("");

  const calculateTax = () => {
    const annualIncome = parseFloat(income);
    const totalDeductions = regime === "old" ? parseFloat(deductions || "0") : 0;
    const taxableIncome = annualIncome - totalDeductions;

    let tax = 0;
    let taxSlab = "";

    if (regime === "new") {
      // New tax regime slabs (2023-24)
      if (taxableIncome <= 300000) {
        tax = 0;
        taxSlab = "0% (Up to ₹3,00,000)";
      } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05;
        taxSlab = "5% (₹3,00,001 - ₹6,00,000)";
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.10;
        taxSlab = "10% (₹6,00,001 - ₹9,00,000)";
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15;
        taxSlab = "15% (₹9,00,001 - ₹12,00,000)";
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.20;
        taxSlab = "20% (₹12,00,001 - ₹15,00,000)";
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.30;
        taxSlab = "30% (Above ₹15,00,000)";
      }
    } else {
      // Old tax regime slabs
      if (taxableIncome <= 250000) {
        tax = 0;
        taxSlab = "0% (Up to ₹2,50,000)";
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
        taxSlab = "5% (₹2,50,001 - ₹5,00,000)";
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.20;
        taxSlab = "20% (₹5,00,001 - ₹10,00,000)";
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.30;
        taxSlab = "30% (Above ₹10,00,000)";
      }
    }

    // Add 4% Health and Education Cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    const result = `
Based on your income of ₹${annualIncome.toLocaleString('en-IN')} under the ${regime} tax regime:

💰 Taxable Income: ₹${taxableIncome.toLocaleString('en-IN')}
📊 Tax Slab: ${taxSlab}
💸 Income Tax: ₹${tax.toLocaleString('en-IN')}
🏥 Health & Education Cess (4%): ₹${cess.toLocaleString('en-IN')}
💯 Total Tax Liability: ₹${totalTax.toLocaleString('en-IN')}

${regime === "old" && totalDeductions > 0 ? `💳 Deductions Applied: ₹${totalDeductions.toLocaleString('en-IN')}` : ''}

Would you like me to explain any deductions you can claim or compare with the other tax regime?`;

    onCalculationComplete(result);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-soft border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Tax Calculator</CardTitle>
        </div>
        <CardDescription>
          Calculate your income tax liability
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="income">Annual Income (₹)</Label>
          <Input
            id="income"
            type="number"
            placeholder="e.g., 800000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regime">Tax Regime</Label>
          <Select value={regime} onValueChange={setRegime}>
            <SelectTrigger>
              <SelectValue placeholder="Select tax regime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Tax Regime (No Deductions)</SelectItem>
              <SelectItem value="old">Old Tax Regime (With Deductions)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {regime === "old" && (
          <div className="space-y-2">
            <Label htmlFor="deductions">Total Deductions (₹)</Label>
            <Input
              id="deductions"
              type="number"
              placeholder="e.g., 150000"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className="transition-all duration-200"
            />
          </div>
        )}

        <Button 
          onClick={calculateTax}
          disabled={!income}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
        >
          Calculate Tax
        </Button>
      </CardContent>
    </Card>
  );
};