export class ArrayChunker {
    static chunkArray(array, chunkLength) {
        let chunks = [];
        for (let i = 0; i < array.length; i += chunkLength) {
            chunks.push(array.slice(i, i + chunkLength))
        }
        return chunks;
    }
}
