"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "black",
  color: "white",
  border: "2px solid ",
  boxShadow: 24,
  p: 3,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(
          "https://api.spoonacular.com/recipes/findByIngredients?apiKey=72dc9630339b438f9c1f0d0d7be7333c&ingredients=chicken,egg,dairy,bread,garlic,onion,meat,sausage"
        );
        const data = await response.json();
        console.log("API response:", data);

        if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          console.error("Unexpected API response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
    updateInventory();
  }, []);

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, "inventory"));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
        await updateInventory();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, categoryFilter]);

  const handleSearch = () => {
    let filtered = inventory;
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }
    setFilteredInventory(filtered);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleItemClick = (itemName) => {
    setSelectedItem(itemName);
  };

  const isIngredientAvailable = (ingredient) => {
    return inventory.some(
      (item) =>
        item.name.toLowerCase() === ingredient.toLowerCase() &&
        item.quantity > 0
    );
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.usedIngredients.some((ingredient) =>
      isIngredientAvailable(ingredient.name)
    )
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={5}
    >
      <Box width="800px" mb={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            id="search-bar"
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <Typography color="white">Filter by Category:</Typography>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{
              "& .MuiSelect-select": {
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "white",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="Category1">Category1</MenuItem>
            <MenuItem value="Category2">Category2</MenuItem>
            {/* Add more categories as needed */}
          </Select>
        </Stack>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Item
          </Typography>
          <Stack width="80%" direction={"columnow"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      <Box border={"1px solid #333"}>
        <Box
          width="600px"
          height="100px"
          bgcolor={"white"}
          color={"green"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="600px" height="300px" spacing={2} overflow={"auto"}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"white"}
              paddingX={5}
            >
              <Typography variant={"p"} color={"#333"} textAlign={"center"}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Typography variant={"p"} color={"#333"}>
                  Quantity: {quantity}
                </Typography>
                <Button variant="outlined" onClick={() => addItem(name)}>
                  Add
                </Button>

                <Button variant="outlined" onClick={() => removeItem(name)}>
                  Remove
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleItemClick(name)}
                >
                  Show Recipes
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {selectedItem && (
        <Box border={"20px solid #333"} mt={5}>
          <Box
            width="800px"
            height="100px"
            bgcolor={"white"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography variant={"p"} color={"#333"} textAlign={"center"}>
              Recipes for {selectedItem}
            </Typography>
          </Box>
          <Box width="800px" maxHeight="600px" overflow="auto" bgcolor="white">
            <TableContainer component={Paper} sx={{ maxHeight: "inherit" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Recipe Name</TableCell>
                    <TableCell>Ingredients</TableCell>
                    <TableCell>Available Ingredients</TableCell>
                    <TableCell>Unavailable Ingredients</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecipes.map((recipe) => {
                    const availability = recipe.usedIngredients.map(
                      (ingredient) => ({
                        item: ingredient.name,
                        available: isIngredientAvailable(ingredient.name),
                      })
                    );

                    const availableItems = availability
                      .filter((item) => item.available)
                      .map((item) => item.item)
                      .join(", ");
                    const unavailableItems = availability
                      .filter((item) => !item.available)
                      .map((item) => item.item)
                      .join(", ");

                    return (
                      <TableRow key={recipe.id}>
                        <TableCell>{recipe.title}</TableCell>
                        <TableCell>
                          {recipe.usedIngredients
                            .map((ingredient) => ingredient.name)
                            .join(", ")}
                        </TableCell>
                        <TableCell>{availableItems}</TableCell>
                        <TableCell>{unavailableItems}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
}
