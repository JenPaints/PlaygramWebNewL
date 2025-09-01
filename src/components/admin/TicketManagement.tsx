import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const TicketManagement: React.FC = () => {
  interface Enquiry {
    _id: Id<'enquiries'>;
    name: string;
    sport: string;
    email: string;
    phone?: string;
    message: string;
    status: 'new' | 'contacted' | 'resolved';
    _creationTime: number;
  }

  const enquiries = useQuery(api.enquiries.getAllEnquiries) ?? [] as Enquiry[];
  const updateStatus = useMutation(api.enquiries.updateEnquiryStatus);

  const handleStatusChange = async (enquiryId: Id<'enquiries'>, newStatus: 'new' | 'contacted' | 'resolved') => {
    try {
      await updateStatus({ enquiryId, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enquiries.map((enquiry: Enquiry) => (
              <div key={enquiry._id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{enquiry.name} - {enquiry.sport}</h3>
                <p className="text-sm text-gray-600">Email: {enquiry.email}</p>
                <p className="text-sm text-gray-600">Phone: {enquiry.phone}</p>
                <p className="mt-2">{enquiry.message}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}>
                    {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                  </span>
                  <Select
                    defaultValue={enquiry.status}
                    onValueChange={(value: string) => handleStatusChange(enquiry._id, value as 'new' | 'contacted' | 'resolved')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {enquiries.length === 0 && <p>No tickets available.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketManagement;