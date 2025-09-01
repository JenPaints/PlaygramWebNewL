import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  Search,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  History,
  Filter,
  Download
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SessionManagementProps {}

const SessionManagement: React.FC<SessionManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [sessionsToAdjust, setSessionsToAdjust] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAdjustmentHistory, setShowAdjustmentHistory] = useState(false);

  // Queries
  const enrollments = useQuery(api.sessionAdjustments.getEnrollmentsForSessionManagement) || [];
  const searchResults = useQuery(
    api.sessionAdjustments.searchEnrollments,
    searchTerm.length >= 2 ? { searchTerm } : 'skip'
  ) || [];
  const adjustmentHistory = useQuery(api.sessionAdjustments.getAllSessionAdjustments, { limit: 100 }) || [];
  const selectedEnrollmentAdjustments = useQuery(
    api.sessionAdjustments.getSessionAdjustments,
    selectedEnrollment ? { enrollmentId: selectedEnrollment._id } : 'skip'
  ) || [];

  // Mutations
  const addSessions = useMutation(api.sessionAdjustments.addSessionsToStudent);
  const removeSessions = useMutation(api.sessionAdjustments.removeSessionsFromStudent);

  // Get current user (admin)
  const { user: currentUser } = useAuth();
  
  // Use admin ID if available, otherwise undefined
  const adminId = currentUser?.uid ? (currentUser.uid as Id<'users'>) : undefined;

  const displayEnrollments = searchTerm.length >= 2 ? searchResults : enrollments;

  const handleAdjustSessions = async () => {
    if (!selectedEnrollment || !reason.trim() || sessionsToAdjust <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (adjustmentType === 'add') {
        await addSessions({
          enrollmentId: selectedEnrollment._id,
          sessionsToAdd: sessionsToAdjust,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
          adjustedBy: adminId,
        });
        toast.success(`Successfully added ${sessionsToAdjust} sessions`);
      } else {
        await removeSessions({
          enrollmentId: selectedEnrollment._id,
          sessionsToRemove: sessionsToAdjust,
          reason: reason.trim(),
          notes: notes.trim() || undefined,
          adjustedBy: adminId,
        });
        toast.success(`Successfully removed ${sessionsToAdjust} sessions`);
      }

      // Reset form
      setSelectedEnrollment(null);
      setSessionsToAdjust(1);
      setReason('');
      setNotes('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adjusting sessions:', error);
      toast.error('Failed to adjust sessions');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'add_sessions':
        return 'bg-green-100 text-green-800';
      case 'remove_sessions':
        return 'bg-red-100 text-red-800';
      case 'reset_sessions':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdjustmentTypeLabel = (type: string) => {
    switch (type) {
      case 'add_sessions':
        return 'Added';
      case 'remove_sessions':
        return 'Removed';
      case 'reset_sessions':
        return 'Reset';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Management</h1>
          <p className="text-gray-600">Add or remove sessions for students</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAdjustmentHistory(!showAdjustmentHistory)}
          >
            <History className="w-4 h-4 mr-2" />
            {showAdjustmentHistory ? 'Hide History' : 'Show History'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Students
          </CardTitle>
          <CardDescription>
            Search by student name, ID, or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Enrollments</CardTitle>
          <CardDescription>
            {displayEnrollments.length} enrollments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayEnrollments.map((enrollment) => {
                  const progressPercentage = enrollment.sessionsTotal > 0 
                    ? (enrollment.sessionsAttended / enrollment.sessionsTotal) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={enrollment._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {enrollment.user.studentId || enrollment.user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {enrollment.sport?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {enrollment.batch?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">
                            {enrollment.sessionsAttended} / {enrollment.sessionsTotal}
                          </div>
                          <div className="text-xs text-gray-500">
                            {enrollment.sessionsTotal - enrollment.sessionsAttended} remaining
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {progressPercentage.toFixed(0)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adjust
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              // Show adjustment history for this enrollment
                            }}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment History */}
      {showAdjustmentHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Session Adjustment History
            </CardTitle>
            <CardDescription>
              Recent session adjustments made by administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Adjusted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustmentHistory.map((adjustment) => (
                    <TableRow key={adjustment._id}>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(adjustment.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{adjustment.studentId}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAdjustmentTypeColor(adjustment.adjustmentType)}>
                          {getAdjustmentTypeLabel(adjustment.adjustmentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={`font-medium ${
                            adjustment.sessionsAdjusted > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {adjustment.sessionsAdjusted > 0 ? '+' : ''}{adjustment.sessionsAdjusted}
                          </div>
                          <div className="text-xs text-gray-500">
                            {adjustment.previousSessionsTotal} → {adjustment.newSessionsTotal}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm">{adjustment.reason}</div>
                          {adjustment.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {adjustment.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{adjustment.adjustedByName}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Adjustment Modal */}
      {isDialogOpen && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Adjust Sessions</h3>
              <p className="text-gray-600">Add or remove sessions for {selectedEnrollment.user.name}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Current Sessions</div>
                <div className="text-lg font-medium">
                  {selectedEnrollment.sessionsAttended} / {selectedEnrollment.sessionsTotal}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Adjustment Type</div>
                <Select value={adjustmentType} onValueChange={(value: 'add' | 'remove') => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Sessions</SelectItem>
                    <SelectItem value="remove">Remove Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Number of Sessions</div>
                <Input
                  type="number"
                  min="1"
                  value={sessionsToAdjust}
                  onChange={(e) => setSessionsToAdjust(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Reason *</div>
                <Textarea
                  placeholder="Please provide a reason for this adjustment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Additional Notes</div>
                <Textarea
                  placeholder="Optional additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedEnrollment(null);
                    setReason('');
                    setNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdjustSessions}>
                  {adjustmentType === 'add' ? (
                    <Plus className="w-4 h-4 mr-2" />
                  ) : (
                    <Minus className="w-4 h-4 mr-2" />
                  )}
                  {adjustmentType === 'add' ? 'Add' : 'Remove'} Sessions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;