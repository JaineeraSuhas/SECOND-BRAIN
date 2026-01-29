import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Document } from '../types';

export function useDocuments() {
    const queryClient = useQueryClient();

    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Document[];
        },
    });

    const createDocument = useMutation({
        mutationFn: async (document: Partial<Document>) => {
            const { data, error } = await supabase
                .from('documents')
                .insert(document)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const updateDocument = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
            const { data, error } = await supabase
                .from('documents')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const deleteDocument = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    return {
        documents,
        isLoading,
        createDocument,
        updateDocument,
        deleteDocument,
    };
}
