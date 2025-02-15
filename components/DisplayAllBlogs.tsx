import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import MarkdownRenderer from "./MarkdownRenderer";

const DisplayAllBlogs = ({ videoId }: { videoId: string }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [groupedBlogs, setGroupedBlogs] = useState<
    Record<string, Record<string, any[]>>
  >({});
  const [selectedGroup, setSelectedGroup] = useState<{
    title: string;
    version: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(
          `https://cms.flowautomate.io/api/video-to-blogs?filters[videoId][$eq]=${videoId}&populate=*`
        );
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        // Assuming the API returns the video details in data.data[0]
        const blogs = data.data?.[0]?.attributes?.Related_Blogs || [];
        setRelatedBlogs(blogs);

        // Group blogs by Title and Version
        const groups: Record<string, Record<string, any[]>> = {};
        blogs.forEach((blog: any) => {
          const title = blog.Title || "Untitled";
          const version = blog.Version || "Unknown";
          if (!groups[title]) groups[title] = {};
          if (!groups[title][version]) groups[title][version] = [];
          groups[title][version].push(blog);
        });
        setGroupedBlogs(groups);

        // Set default selections if groups exist
        const defaultTitle = Object.keys(groups)[0];
        if (defaultTitle) {
          const defaultVersion = Object.keys(groups[defaultTitle])[0];
          setSelectedGroup({ title: defaultTitle, version: defaultVersion });
        }
      } catch (error) {
        console.error("Error fetching blogs", error);
      } finally {
        setLoading(false);
      }
    }
    if (videoId) {
      fetchBlogs();
    }
  }, [videoId]);

  if (loading) return <p>Loading blogs...</p>;

  return (
    <div>
      <h3 className="font-bold mb-2">All Related Blogs</h3>
      <div className="flex gap-4 mb-4">
        {/* Dropdown for blog titles */}
        <Select
          value={selectedGroup?.title}
          onValueChange={(newTitle) => {
            // When title changes, update version with the first available version for that title.
            const versions = Object.keys(groupedBlogs[newTitle] || {});
            setSelectedGroup({
              title: newTitle,
              version: versions[0] || "Unknown",
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Blog Title" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(groupedBlogs).map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dropdown for blog versions (if a title is selected) */}
        {selectedGroup?.title && (
          <Select
            value={selectedGroup.version}
            onValueChange={(newVersion) =>
              setSelectedGroup(
                (prev) => prev && { ...prev, version: newVersion }
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Version" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(groupedBlogs[selectedGroup.title] || {}).map(
                (version) => (
                  <SelectItem key={version} value={version}>
                    Version {version}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        {selectedGroup &&
        groupedBlogs[selectedGroup.title] &&
        groupedBlogs[selectedGroup.title][selectedGroup.version] ? (
          groupedBlogs[selectedGroup.title][selectedGroup.version].map(
            (blog) => (
              <Card key={blog.id} className="mb-2">
                <CardHeader>
                  <CardTitle>{blog.Title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={blog.Content} />
                  <p>Target Audience: {blog.Target_audience}</p>
                  <p>Audience Age Group: {blog.Audience_age_group}</p>
                  <p>Writing Style: {blog.Writing_style}</p>
                </CardContent>
              </Card>
            )
          )
        ) : (
          <p>No blogs available for the selected group.</p>
        )}
      </div>
    </div>
  );
};

export default DisplayAllBlogs;
