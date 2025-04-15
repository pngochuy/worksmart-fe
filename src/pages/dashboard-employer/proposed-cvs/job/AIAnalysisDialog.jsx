/* eslint-disable react/prop-types */
// Component AIAnalysisDialog
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Brain, Briefcase, Check, Info } from "lucide-react";
export const AIAnalysisDialog = ({ open, onOpenChange, candidate }) => {
  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-md">
                {candidate.avatar ? (
                  <AvatarImage src={candidate.avatar} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {candidate.fullName?.charAt(0) || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{candidate.fullName}</h2>
                <p className="text-muted-foreground">
                  {candidate.featuredCVs?.[0]?.jobPosition}
                </p>
              </div>
            </div>
            <Badge
              className={`text-md px-3 py-1 ${
                candidate.matchPercentage >= 90
                  ? "bg-green-100 text-green-800"
                  : candidate.matchPercentage >= 80
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {candidate.matchPercentage}% Match
            </Badge>
          </div>

          {/* AI Analysis Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Brain className="mr-2 h-5 w-5 text-blue-600" />
              AI Analysis
            </h3>
            <div className="p-4 bg-slate-50 rounded-md border">
              <p className="mb-4">
                {candidate.matchAnalysis.overallAssessment}
              </p>

              {candidate.matchAnalysis.strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Strengths:</h4>
                  <ul className="space-y-2">
                    {candidate.matchAnalysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {candidate.matchAnalysis.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Areas for improvement:</h4>
                  <ul className="space-y-2">
                    {candidate.matchAnalysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start">
                        <Info className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Relevant Experience Section */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
              Relevant Experience
            </h3>
            <div className="space-y-3">
              {candidate.experienceDetails.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-md border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <div className="font-medium">
                      {exp.position} at {exp.company}
                    </div>
                    <div className="text-sm text-slate-500">{exp.duration}</div>
                  </div>
                  <Badge
                    className={`mb-3 ${
                      exp.relevance === "High" || exp.relevance === "Very High"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {exp.relevance} relevance
                  </Badge>
                  <div className="text-sm text-slate-600 space-y-2 mt-3">
                    {exp.highlights.map((highlight, hidx) => (
                      <div key={hidx} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
