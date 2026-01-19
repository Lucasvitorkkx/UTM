'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLinkSchema, CreateLinkInput } from '@/lib/validations/links';
import { createLinkAction } from '@/actions/links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateLinkButton() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const form = useForm<CreateLinkInput>({
        resolver: zodResolver(createLinkSchema),
        defaultValues: {
            destinationUrl: '',
            slug: '',
            utmSource: '',
            utmMedium: '',
            utmCampaign: '',
            utmTerm: '',
            utmContent: '',
        },
    });

    async function onSubmit(data: CreateLinkInput) {
        const result = await createLinkAction(data);
        if (result.success) {
            setOpen(false);
            form.reset();
            router.refresh();
        } else {
            form.setError('root', { message: result.error || 'Something went wrong' });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Create New Link</DialogTitle>
                    <DialogDescription>
                        Add a destination URL and configure UTM parameters for tracking.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="destinationUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/landing-page" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custom Slug (Optional)</FormLabel>
                                    <FormControl>
                                        <div className="flex">
                                            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground text-sm">
                                                track.flux/
                                            </div>
                                            <Input placeholder="summer-sale-2026" className="rounded-l-none" {...field} value={field.value || ''} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>Leave empty for a random short link.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Tabs defaultValue="utm" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="utm">UTM Builder</TabsTrigger>
                                <TabsTrigger value="pixels" disabled>Pixels (Pro)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="utm" className="space-y-3 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="utmSource"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Source (utm_source)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="google, newsletter" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="utmMedium"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Medium (utm_medium)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="cpc, email" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="utmCampaign"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Campaign (utm_campaign)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="summer_sale" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="utmContent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Content (utm_content)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="logolink" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="utmTerm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Term (utm_term)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="running shoes" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        {form.formState.errors.root && (
                            <div className="text-sm font-medium text-destructive text-red-500">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>Create Link</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
