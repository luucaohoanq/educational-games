package com.example.be.controller;

import com.example.be.dto.BucketInfo;
import com.example.be.dto.ObjectInfo;
import io.minio.*;
import io.minio.messages.Bucket;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/minio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MinioController {

    private final MinioClient minioClient;

    @GetMapping("/buckets")
    public List<BucketInfo> listBuckets() throws Exception {
        List<BucketInfo> buckets = new ArrayList<>();
        for (Bucket bucket : minioClient.listBuckets()) {
            ZonedDateTime creationDate = bucket.creationDate();
            buckets.add(new BucketInfo(
                bucket.name(),
                creationDate != null ? creationDate.toString() : "N/A"
            ));
        }
        return buckets;
    }

    @PostMapping("/buckets")
    public ResponseEntity<String> createBucket(@RequestParam String bucketName) throws Exception {
        minioClient.makeBucket(MakeBucketArgs.builder()
            .bucket(bucketName)
            .build());
        
        // Set public read policy
        String policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]}]}";
        minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
            .bucket(bucketName)
            .config(policy)
            .build());
        
        return ResponseEntity.ok("Bucket created: " + bucketName);
    }

    @DeleteMapping("/buckets/{bucketName}")
    public ResponseEntity<String> deleteBucket(@PathVariable String bucketName) throws Exception {
        minioClient.removeBucket(RemoveBucketArgs.builder()
            .bucket(bucketName)
            .build());
        return ResponseEntity.ok("Bucket deleted: " + bucketName);
    }

    @GetMapping("/buckets/{bucketName}/objects")
    public List<ObjectInfo> listObjects(@PathVariable String bucketName) throws Exception {
        List<ObjectInfo> objects = new ArrayList<>();
        Iterable<Result<Item>> results = minioClient.listObjects(
            ListObjectsArgs.builder()
                .bucket(bucketName)
                .build()
        );
        
        for (Result<Item> result : results) {
            Item item = result.get();
            objects.add(new ObjectInfo(
                item.objectName(),
                item.size(),
                item.lastModified() != null ? item.lastModified().toString() : "N/A"
            ));
        }
        return objects;
    }

    @DeleteMapping("/buckets/{bucketName}/objects/{objectName}")
    public ResponseEntity<String> deleteObject(
        @PathVariable String bucketName,
        @PathVariable String objectName
    ) throws Exception {
        minioClient.removeObject(RemoveObjectArgs.builder()
            .bucket(bucketName)
            .object(objectName)
            .build());
        return ResponseEntity.ok("Object deleted: " + objectName);
    }

    @GetMapping("/buckets/{bucketName}/exists")
    public ResponseEntity<Boolean> bucketExists(@PathVariable String bucketName) throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
            .bucket(bucketName)
            .build());
        return ResponseEntity.ok(exists);
    }
}
