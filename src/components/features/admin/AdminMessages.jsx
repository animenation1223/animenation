import React from 'react';
import { base44 } from '@/services/api';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminMessages() {
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.ContactMessage.list('-created_date'),
    initialData: [],
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactMessage.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast.success('Marked as read');
    },
  });

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        messages.map(msg => (
          <div key={msg.id} className={`p-4 rounded-xl border ${msg.is_read ? 'bg-card border-border/50' : 'bg-primary/5 border-primary/20'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{msg.name}</p>
                  {!msg.is_read && <Badge className="bg-primary/10 text-primary border-0 text-[10px]">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{msg.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {msg.created_date && format(new Date(msg.created_date), 'dd MMM')}
                </span>
                {!msg.is_read && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => markReadMutation.mutate(msg.id)}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {msg.subject && <p className="text-sm font-medium text-foreground mb-1">{msg.subject}</p>}
            <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
          </div>
        ))
      )}
    </div>
  );
}