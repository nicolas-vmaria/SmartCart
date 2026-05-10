<?php

class ProductService{
    function getAllProducts(){
        return ['message' => 'Retornando todos os produtos'];
    }

    function getProductById($id){
        return ['message' => "Retornando produto $id"];
    }
}