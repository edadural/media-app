import { Models } from "appwrite"

// postun istatistiklerini veya görselleştirmelerini oluşturmak icin bilgiler
type PostStatsProps = {
    post: Models.Document;
    userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {
    return (
        <div>PostStats</div>
    )
}

export default PostStats