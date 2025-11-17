import { CustomerService } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerTableProps {
  customers: CustomerService[];
  onGeneratePDF: (customer: CustomerService) => void;
}

export default function CustomerTable({ customers, onGeneratePDF }: CustomerTableProps) {
  return (
    <div className="grid gap-4">
      {customers.map((customer, index) => (
        <Card key={index} className="p-6" data-testid={`card-customer-${index}`}>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground" data-testid={`text-name-${index}`}>
                    {customer.contactName || "Unknown"}
                  </h3>
                  {customer.nurseVisit && (
                    <Badge variant={customer.nurseVisit.toLowerCase() === 'yes' ? 'default' : 'secondary'}>
                      Nurse Visit: {customer.nurseVisit}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {customer.phoneNumber && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                  )}
                  
                  {customer.clientEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{customer.clientEmail}</span>
                    </div>
                  )}

                  {customer.clientAddress && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.clientAddress}</span>
                    </div>
                  )}

                  {customer.zipCode && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>ZIP: {customer.zipCode}</span>
                    </div>
                  )}

                  {customer.dateTime && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{customer.dateTime}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {customer.referral && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Referral:</span>
                      <p className="text-sm text-muted-foreground">{customer.referral}</p>
                    </div>
                  )}

                  {customer.serviceExperience && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Service Experience:</span>
                      <p className="text-sm text-muted-foreground">{customer.serviceExperience}</p>
                    </div>
                  )}

                  {customer.patientIdentity && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Patient:</span>
                      <p className="text-sm text-muted-foreground">{customer.patientIdentity}</p>
                    </div>
                  )}

                  {customer.serviceHours && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Service Hours:</span>
                      <p className="text-sm text-muted-foreground">{customer.serviceHours}</p>
                    </div>
                  )}

                  {customer.serviceTime && (
                    <div>
                      <span className="text-sm font-medium text-foreground">Service Time:</span>
                      <p className="text-sm text-muted-foreground">{customer.serviceTime}</p>
                    </div>
                  )}
                </div>

                {customer.patientProblem && (
                  <div className="pt-2">
                    <span className="text-sm font-medium text-foreground">Patient Problem:</span>
                    <p className="text-sm text-muted-foreground mt-1">{customer.patientProblem}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => onGeneratePDF(customer)}
                size="sm"
                data-testid={`button-generate-pdf-${index}`}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
