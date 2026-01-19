import { getLinksAction } from '@/actions/links';
import { CreateLinkButton } from '@/components/links/create-link-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function LinksPage() {
    const links = await getLinksAction();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Links</h2>
                    <p className="text-muted-foreground">Manage your tracking links and UTMs.</p>
                </div>
                <CreateLinkButton />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Links</CardTitle>
                    <CardDescription>A list of your tracked links.</CardDescription>
                </CardHeader>
                <CardContent>
                    {links.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No links created yet. Click "Create Link" to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Short Link</TableHead>
                                    <TableHead className="hidden md:table-cell">Destination</TableHead>
                                    <TableHead className="hidden md:table-cell">Campaign</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {links.map((link) => (
                                    <TableRow key={link.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary">/{link.slug}</span>
                                                <Badge variant="outline" className="text-xs font-normal">Active</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={link.destinationUrl}>
                                            {link.destinationUrl}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {link.utmCampaign ? (
                                                <Badge variant="secondary">{link.utmCampaign}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(link.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Copy className="h-4 w-4" />
                                                <span className="sr-only">Copy</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
