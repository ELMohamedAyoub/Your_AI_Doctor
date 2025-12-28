"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Phone, Ambulance } from "lucide-react";
import { type RedFlagResult, type AlertLevel, getAlertIcon } from "@/lib/redFlagDetector";
import { Button } from "@/components/ui/button";

interface RedFlagAlertProps {
  result: RedFlagResult;
  onDismiss?: () => void;
}

export default function RedFlagAlert({ result, onDismiss }: RedFlagAlertProps) {
  if (!result.hasRedFlags) {
    return null;
  }

  const getIcon = (level: AlertLevel) => {
    switch (level) {
      case "RED":
        return <Ambulance className="h-5 w-5" />;
      case "ORANGE":
        return <AlertTriangle className="h-5 w-5" />;
      case "YELLOW":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getVariant = (level: AlertLevel): "default" | "destructive" => {
    return level === "RED" || level === "ORANGE" ? "destructive" : "default";
  };

  const getBorderColor = (level: AlertLevel) => {
    switch (level) {
      case "RED":
        return "border-red-500 border-2";
      case "ORANGE":
        return "border-orange-500 border-2";
      case "YELLOW":
        return "border-yellow-500 border-2";
      default:
        return "border-green-500";
    }
  };

  const getEmergencyAction = () => {
    if (result.level === "RED") {
      return (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-500">
          <div className="flex items-start gap-3">
            <Ambulance className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                EMERGENCY - IMMEDIATE ACTION REQUIRED
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                The symptoms you've reported require immediate medical attention.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => window.open("tel:911")}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call 911
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open("tel:emergency-contact")}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Emergency Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (result.level === "ORANGE") {
      return (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-500">
          <div className="flex items-start gap-3">
            <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                URGENT - Contact Your Surgeon
              </h4>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                These symptoms require prompt evaluation by your surgeon within the next 2 hours.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="border-orange-500 text-orange-700 hover:bg-orange-50"
                onClick={() => window.open("tel:surgeon-contact")}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Surgeon's Office
              </Button>
            </div>
          </div>
        </div>
      );
    } else if (result.level === "YELLOW") {
      return (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-500">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                Monitor and Contact Surgeon's Office
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                These symptoms should be discussed with your surgeon during regular business hours.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`${getBorderColor(result.level)} shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {getIcon(result.level)}
          <CardTitle className="text-lg">
            {getAlertIcon(result.level)} Symptom Alert
          </CardTitle>
        </div>
        <CardDescription className="font-semibold">
          {result.urgentAction}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant={getVariant(result.level)} className="mb-4">
          <AlertTitle>Detected Concerning Symptoms:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-2 mt-2">
              {result.flags.map((flag, index) => (
                <li key={index} className="text-sm">
                  <strong>{flag.symptom}</strong>
                  <p className="ml-5 mt-1 text-xs">{flag.action}</p>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {getEmergencyAction()}

        <div className="mt-4 text-xs text-muted-foreground">
          <p><strong>Note:</strong> This is an automated screening tool. Always trust your instincts - if something feels seriously wrong, seek immediate medical attention.</p>
        </div>

        {onDismiss && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              I understand
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
